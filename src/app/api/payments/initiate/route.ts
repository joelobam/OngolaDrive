import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiateCinetPayPayment } from '@/lib/cinetpay'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { orderId } = await req.json()
  if (!orderId) {
    return NextResponse.json({ error: 'orderId requis' }, { status: 400 })
  }

  // Vérifier que la commande appartient au client
  const { data: order } = await supabase
    .from('orders')
    .select('id, total, order_number, customer_id')
    .eq('id', orderId)
    .eq('customer_id', user.id)
    .single() as {
      data: { id: string; total: number; order_number: string; customer_id: string } | null
      error: unknown
    }

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  // Vérifier que le paiement est bien en attente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payment } = await (supabase.from('payments') as any)
    .select('id, status, method')
    .eq('order_id', orderId)
    .single() as { data: { id: string; status: string; method: string } | null; error: unknown }

  if (!payment) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  }

  if (payment.status === 'completed') {
    return NextResponse.json({ error: 'Ce paiement est déjà complété' }, { status: 400 })
  }

  // Si cash (retrait), pas besoin de CinetPay
  if (payment.method === 'cash') {
    return NextResponse.json({ error: 'Paiement cash traité directement' }, { status: 400 })
  }

  // Récupérer le profil client
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single() as { data: { full_name: string; phone: string | null } | null; error: unknown }

  try {
    const result = await initiateCinetPayPayment({
      orderId: order.id,
      amount: order.total,
      description: `Commande ${order.order_number} — OngolaDrive`,
      customerName: profile?.full_name ?? 'Client',
      customerEmail: user.email,
      customerPhone: profile?.phone ?? undefined,
    })

    // Sauvegarder le transaction_id CinetPay
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('payments') as any)
      .update({
        transaction_id: result.transactionId,
        provider: 'cinetpay',
        status: 'processing',
      })
      .eq('id', payment.id)

    return NextResponse.json({ paymentUrl: result.paymentUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
