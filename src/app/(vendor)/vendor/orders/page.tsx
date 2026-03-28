import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import OrderItemStatusUpdate from '@/components/vendor/OrderItemStatusUpdate'

type OrderItem = {
  id: string; product_name: string; quantity: number
  unit_price: number; subtotal: number; status: string; notes: string | null
  orders: { order_number: string; created_at: string; delivery_type: string; customer: { full_name: string; phone: string | null } | null } | null
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'En attente',      className: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmée',       className: 'bg-blue-100 text-blue-700' },
  preparing:  { label: 'En préparation',  className: 'bg-purple-100 text-purple-700' },
  ready:      { label: 'Prête',           className: 'bg-indigo-100 text-indigo-700' },
  picked_up:  { label: 'Récupérée',       className: 'bg-orange-100 text-orange-700' },
  delivered:  { label: 'Livrée',          className: 'bg-primary-light text-primary-dark' },
  cancelled:  { label: 'Annulée',         className: 'bg-red-100 text-red-700' },
}

const DELIVERY_LABELS: Record<string, string> = {
  delivery: '🚴 Livraison', pickup: '🏪 Retrait',
}

const TABS = [
  { key: 'pending',   label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'ready',     label: 'Prêtes' },
  { key: 'delivered', label: 'Livrées' },
]

export default async function VendorOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'pending' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_id', user.id).single() as { data: { id: string } | null; error: unknown }

  if (!shop) redirect('/vendor/shop')

  const { data: items } = await supabase
    .from('order_items')
    .select('id, product_name, quantity, unit_price, subtotal, status, notes, orders:order_id(order_number, created_at, delivery_type, customer:customer_id(full_name, phone))')
    .eq('shop_id', shop.id)
    .eq('status', status)
    .order('order_id', { ascending: false }) as { data: OrderItem[] | null; error: unknown }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-500 text-sm mt-1">{items?.length ?? 0} article(s) dans cet état</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {TABS.map(tab => (
          <a key={tab.key} href={`/vendor/orders?status=${tab.key}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              status === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{tab.label}</a>
        ))}
      </div>

      {!items?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400">Aucune commande dans cet état.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{item.orders?.order_number ?? '—'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(STATUS_CONFIG[item.status] ?? { className: 'bg-gray-100 text-gray-500' }).className}`}>
                      {(STATUS_CONFIG[item.status] ?? { label: item.status }).label}
                    </span>
                    <span className="text-xs text-gray-400">{DELIVERY_LABELS[item.orders?.delivery_type ?? ''] ?? ''}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {item.orders?.customer?.full_name ?? '—'}
                    {item.orders?.customer?.phone && ` · ${item.orders.customer.phone}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.orders?.created_at ? new Date(item.orders.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-lg">{formatPrice(item.subtotal)}</p>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-xs text-gray-500">Qté : {item.quantity} · {formatPrice(item.unit_price)} / unité</p>
                  {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">Note : {item.notes}</p>}
                </div>
                <OrderItemStatusUpdate itemId={item.id} currentStatus={item.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
