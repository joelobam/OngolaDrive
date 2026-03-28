import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Phone, MapPin, Store, User } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import DeliveryStatusActions from '@/components/driver/DeliveryStatusActions'
import DriverLocationTracker from '@/components/driver/DriverLocationTracker'

type DeliveryDetail = {
  id: string
  status: string
  order: {
    id: string
    order_number: string
    total: number
    delivery_fee: number
    notes: string | null
    delivery_type: string
    market: { name: string; city: string; address: string | null; location: string | null } | null
    customer: { full_name: string; phone: string | null } | null
    items: Array<{
      id: string
      product_name: string
      quantity: number
      unit_price: number
      subtotal: number
      shop: { name: string; booth_number: string | null; location: string | null } | null
    }>
  } | null
}

const STATUS_LABELS: Record<string, string> = {
  assigned:  'À récupérer au marché',
  picked_up: 'En cours de livraison',
  delivered: 'Livraison terminée',
}

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: delivery } = await supabase
    .from('deliveries')
    .select(`
      id, status,
      order:order_id(
        id, order_number, total, delivery_fee, notes, delivery_type,
        market:market_id(name, city, address, location),
        customer:customer_id(full_name, phone),
        items:order_items(id, product_name, quantity, unit_price, subtotal, shop:shop_id(name, booth_number, location))
      )
    `)
    .eq('id', id)
    .eq('driver_id', user.id)
    .single() as { data: DeliveryDetail | null; error: unknown }

  if (!delivery) notFound()

  const order = delivery.order
  const isDone = delivery.status === 'delivered'

  // Regrouper items par boutique
  type OrderItem = NonNullable<typeof order>['items'][number]
  const byShop: Record<string, OrderItem[]> = {}
  for (const item of order?.items ?? []) {
    const shopName = item.shop?.name ?? 'Boutique inconnue'
    byShop[shopName] = byShop[shopName] ?? []
    byShop[shopName].push(item)
  }

  return (
    <div className="px-4 py-6">
      <Link href="/driver/deliveries" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
        <ChevronLeft size={16} /> Retour
      </Link>

      {/* En-tête */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order?.order_number}</h1>
          <p className={`text-sm mt-1 font-medium ${isDone ? 'text-primary' : 'text-orange-500'}`}>
            {STATUS_LABELS[delivery.status] ?? delivery.status}
          </p>
        </div>
        <p className="text-lg font-bold text-primary">{formatPrice(order?.total ?? 0)}</p>
      </div>

      {/* GPS tracker actif si livraison en cours */}
      {!isDone && <DriverLocationTracker deliveryId={delivery.id} />}

      {/* Client */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <User size={13} /> Client
        </h2>
        <p className="font-semibold text-gray-800">{order?.customer?.full_name}</p>
        {order?.customer?.phone && (
          <a href={`tel:${order.customer.phone}`}
            className="flex items-center gap-2 mt-2 text-sm text-primary font-medium bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            <Phone size={15} /> {order.customer.phone}
          </a>
        )}
        {order?.notes && (
          <p className="text-sm text-gray-500 italic mt-2 border-t border-gray-50 pt-2">{order.notes}</p>
        )}
      </div>

      {/* Marché (point de collecte) */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Store size={13} /> Point de collecte
        </h2>
        <p className="font-semibold text-gray-800">{order?.market?.name}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <MapPin size={13} className="text-primary" />
          {order?.market?.address ?? order?.market?.city}
        </p>
      </div>

      {/* Articles par boutique */}
      <div className="bg-white rounded-xl border border-gray-100 mb-3 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Articles à collecter</h2>
        </div>
        {Object.entries(byShop).map(([shopName, items]) => (
          <div key={shopName}>
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Store size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">{shopName}</span>
              {items[0]?.shop?.booth_number && (
                <span className="text-xs text-gray-400">· Kiosque {items[0].shop.booth_number}</span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {items.map(item => (
                <div key={item.id} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-700">{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-medium text-gray-800">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 border-t border-gray-100 text-sm font-semibold text-gray-800">
          <span>Total commande</span>
          <span className="text-primary">{formatPrice(order?.total ?? 0)}</span>
        </div>
      </div>

      {/* Actions statut */}
      {!isDone && (
        <DeliveryStatusActions deliveryId={delivery.id} currentStatus={delivery.status} />
      )}

      {isDone && (
        <div className="bg-primary-50 border border-primary-light rounded-xl p-4 text-center text-sm text-primary-dark font-medium">
          ✅ Livraison terminée avec succès
        </div>
      )}
    </div>
  )
}
