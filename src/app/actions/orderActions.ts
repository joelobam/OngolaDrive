'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getSvc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type CartItem = {
  shopId: string
  productId: string
  name: string
  image: string | null
  price: number
  quantity: number
}

export async function createOrder(data: {
  marketId: string
  deliveryType: 'delivery' | 'pickup'
  paymentMethod: string
  notes: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}): Promise<{ orderId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const svc = getSvc()

  // Créer la commande
  const { data: order, error: orderError } = await (svc.from('orders') as any)
    .insert({
      market_id: data.marketId,
      customer_id: user.id,
      delivery_type: data.deliveryType,
      delivery_address_id: null,
      status: 'pending',
      subtotal: data.subtotal,
      delivery_fee: data.deliveryFee,
      commission_amount: 0,
      total: data.total,
      notes: data.notes || null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    throw new Error('Erreur lors de la création de la commande.')
  }

  // Insérer les articles
  const { error: itemsError } = await (svc.from('order_items') as any).insert(
    data.items.map(item => ({
      order_id: order.id,
      shop_id: item.shopId,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image ?? null,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      status: 'pending',
    }))
  )

  if (itemsError) {
    // Annuler la commande créée
    await (svc.from('orders') as any).delete().eq('id', order.id)
    throw new Error('Erreur lors de l\'enregistrement des articles.')
  }

  // Créer l'entrée de paiement
  await (svc.from('payments') as any).insert({
    order_id: order.id,
    method: data.paymentMethod,
    status: 'pending',
    amount: data.total,
    currency: 'XAF',
  })

  return { orderId: order.id }
}
