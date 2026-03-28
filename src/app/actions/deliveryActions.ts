'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendNotification } from '@/lib/notifications'

const STATUS_TRANSITION: Record<string, { deliveryNext: string; orderNext: string }> = {
  assigned: { deliveryNext: 'picked_up',  orderNext: 'delivering' },
  picked_up: { deliveryNext: 'delivered', orderNext: 'delivered'  },
}

export async function advanceDeliveryStatus(deliveryId: string, currentStatus: string) {
  const transition = STATUS_TRANSITION[currentStatus]
  if (!transition) throw new Error('Statut invalide')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Utiliser service_role pour les mises à jour et la notification
  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Vérifier que ce livreur est bien assigné à cette livraison
  const { data: delivery } = await svc
    .from('deliveries')
    .select('id, order_id, driver_id')
    .eq('id', deliveryId)
    .single() as { data: { id: string; order_id: string; driver_id: string } | null; error: unknown }

  if (!delivery || delivery.driver_id !== user.id) {
    throw new Error('Livraison introuvable ou non autorisé')
  }

  // Récupérer le customer_id et order_number
  const { data: order } = await svc
    .from('orders')
    .select('id, customer_id, order_number')
    .eq('id', delivery.order_id)
    .single() as { data: { id: string; customer_id: string; order_number: string } | null; error: unknown }

  // Mettre à jour livraison + commande
  await Promise.all([
    (svc.from('deliveries') as any)
      .update({ status: transition.deliveryNext })
      .eq('id', deliveryId),
    (svc.from('orders') as any)
      .update({
        status: transition.orderNext,
        ...(transition.deliveryNext === 'delivered' ? { delivered_at: new Date().toISOString() } : {}),
      })
      .eq('id', delivery.order_id),
  ])

  // Envoyer une notification au client
  if (order?.customer_id) {
    const num = order.order_number ?? delivery.order_id.slice(0, 8).toUpperCase()

    if (transition.deliveryNext === 'picked_up') {
      await sendNotification({
        userId: order.customer_id,
        title: 'Commande en route',
        body: `Votre commande #${num} a été collectée et est en cours de livraison.`,
        type: 'order_update',
        data: { order_id: delivery.order_id },
      })
    } else if (transition.deliveryNext === 'delivered') {
      await sendNotification({
        userId: order.customer_id,
        title: 'Commande livrée',
        body: `Votre commande #${num} a été livrée. Merci pour votre achat !`,
        type: 'order_ready',
        data: { order_id: delivery.order_id },
      })
    }
  }
}
