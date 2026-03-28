import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, MapPin, ShoppingBag } from 'lucide-react'
import OrderStatusTracker from '@/components/client/OrderStatusTracker'
import type { OrderStatus } from '@/hooks/useRealtimeOrder'

type OrderItem = {
  id: string; product_name: string; product_image: string | null
  quantity: number; unit_price: number; subtotal: number; status: string
  shop: { name: string } | null
}
type OrderDetail = {
  id: string; order_number: string; status: string; delivery_type: string
  subtotal: number; delivery_fee: number; total: number; notes: string | null; created_at: string
  market: { name: string; city: string } | null
}

const PAYMENT_LABELS: Record<string, string> = {
  mtn_momo: 'MTN Mobile Money', orange_money: 'Orange Money', card: 'Carte bancaire', cash: 'Cash',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, status, delivery_type, subtotal, delivery_fee, total, notes, created_at, market:market_id(name, city)')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single() as { data: OrderDetail | null; error: unknown }

  if (!order) notFound()

  const [itemsRes, paymentRes] = await Promise.all([
    supabase.from('order_items')
      .select('id, product_name, product_image, quantity, unit_price, subtotal, status, shop:shop_id(name)')
      .eq('order_id', id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('payments') as any).select('method, status').eq('order_id', id).single(),
  ])

  const items = itemsRes.data as OrderItem[] | null
  const payment = paymentRes.data as { method: string; status: string } | null
  const isDelivery = order.delivery_type === 'delivery'

  return (
    <div className="px-4 py-6">
      <Link href="/orders" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
        <ChevronLeft size={16} /> Mes commandes
      </Link>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          {isDelivery ? <><MapPin size={14} /> Livraison</> : <><ShoppingBag size={14} /> Retrait</>}
        </div>
      </div>

      {/* Suivi Realtime */}
      <OrderStatusTracker
        orderId={order.id}
        initialStatus={order.status as OrderStatus}
        deliveryType={order.delivery_type as 'delivery' | 'pickup'}
      />

      {/* Articles */}
      <div className="bg-white rounded-xl border border-gray-100 mb-4">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Articles</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {items?.map(item => (
            <div key={item.id} className="flex gap-3 p-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {item.product_image
                  ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">🛒</div>
                }
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                <p className="text-xs text-gray-400">{item.shop?.name} · Qté {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Récapitulatif paiement */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Paiement</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Sous-total</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Livraison</span><span>{order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'Gratuit'}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-800 pt-1.5 border-t border-gray-100 mt-1.5">
            <span>Total</span><span className="text-primary">{formatPrice(order.total)}</span>
          </div>
          {payment && (
            <p className="text-xs text-gray-400 mt-1">{PAYMENT_LABELS[payment.method] ?? payment.method}</p>
          )}
        </div>
      </div>

      {order.notes && (
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500 italic">{order.notes}</div>
      )}
    </div>
  )
}
