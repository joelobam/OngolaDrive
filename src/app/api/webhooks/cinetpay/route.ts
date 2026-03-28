import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCinetPayPayment, mapCinetPayMethod } from '@/lib/cinetpay'
import { sendNotification } from '@/lib/notifications'
import type { Database } from '@/types/database'

// Webhook utilise le service role (pas de cookies auth)
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>

  try {
    // CinetPay envoie en form-urlencoded
    const text = await req.text()
    body = Object.fromEntries(new URLSearchParams(text))
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { cpm_trans_id: transactionId, cpm_site_id: siteId } = body

  // Vérifier le site_id
  if (siteId !== process.env.CINETPAY_SITE_ID) {
    return NextResponse.json({ error: 'Site ID invalide' }, { status: 403 })
  }

  if (!transactionId) {
    return NextResponse.json({ error: 'transaction_id manquant' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Retrouver le paiement + client associé
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payment } = await (supabase.from('payments') as any)
    .select('id, order_id, status, orders(customer_id, order_number)')
    .eq('transaction_id', transactionId)
    .single() as {
      data: {
        id: string
        order_id: string
        status: string
        orders: { customer_id: string; order_number: string } | null
      } | null
      error: unknown
    }

  if (!payment) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  }

  // Éviter le double traitement
  if (payment.status === 'completed') {
    return NextResponse.json({ message: 'Déjà traité' })
  }

  try {
    const result = await verifyCinetPayPayment(transactionId)

    if (result.status === 'ACCEPTED') {
      const method = mapCinetPayMethod(result.paymentMethod)

      // Marquer le paiement comme complété
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('payments') as any)
        .update({
          status: 'completed',
          method,
          paid_at: new Date().toISOString(),
          provider_ref: transactionId,
        })
        .eq('id', payment.id)

      // Confirmer la commande
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('orders') as any)
        .update({ status: 'confirmed' })
        .eq('id', payment.order_id)
        .eq('status', 'pending')

      // Notifier le client
      if (payment.orders?.customer_id) {
        const orderNum = payment.orders.order_number ?? payment.order_id.slice(0, 8).toUpperCase()
        await sendNotification({
          userId: payment.orders.customer_id,
          title: 'Commande confirmée',
          body: `Votre commande #${orderNum} a été confirmée. Nous préparons votre colis.`,
          type: 'order_update',
          data: { order_id: payment.order_id },
        })
      }

      return NextResponse.json({ message: 'Paiement confirmé' })
    }

    if (result.status === 'REFUSED') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('payments') as any)
        .update({ status: 'failed' })
        .eq('id', payment.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('orders') as any)
        .update({ status: 'cancelled', cancel_reason: 'Paiement refusé', cancelled_at: new Date().toISOString() })
        .eq('id', payment.order_id)

      // Notifier le client
      if (payment.orders?.customer_id) {
        const orderNum = payment.orders.order_number ?? payment.order_id.slice(0, 8).toUpperCase()
        await sendNotification({
          userId: payment.orders.customer_id,
          title: 'Paiement refusé',
          body: `Le paiement de votre commande #${orderNum} a échoué. Veuillez réessayer.`,
          type: 'order_update',
          data: { order_id: payment.order_id },
        })
      }

      return NextResponse.json({ message: 'Paiement refusé' })
    }

    // Toujours 200 pour CinetPay (PENDING = on attend)
    return NextResponse.json({ message: 'En attente' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[CinetPay webhook]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
