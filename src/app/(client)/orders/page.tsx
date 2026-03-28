import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, Package } from 'lucide-react'

type Order = {
  id: string; order_number: string; status: string
  delivery_type: string; total: number; created_at: string
  market: { name: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'En attente',     className: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmée',      className: 'bg-blue-100 text-blue-700' },
  preparing:  { label: 'En préparation', className: 'bg-purple-100 text-purple-700' },
  ready:      { label: 'Prête',          className: 'bg-indigo-100 text-indigo-700' },
  picked_up:  { label: 'Récupérée',      className: 'bg-orange-100 text-orange-700' },
  delivering: { label: 'En livraison',   className: 'bg-orange-100 text-orange-700' },
  delivered:  { label: 'Livrée',         className: 'bg-primary-light text-primary-dark' },
  cancelled:  { label: 'Annulée',        className: 'bg-red-100 text-red-700' },
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, delivery_type, total, created_at, market:market_id(name)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false }) as { data: Order[] | null; error: unknown }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Mes commandes</h1>

      {!orders?.length ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <Package size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium mb-1">Aucune commande</p>
          <p className="text-sm text-gray-400 mb-6">Vos commandes apparaîtront ici.</p>
          <Link href="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark">
            Explorer les marchés
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-500' }
            return (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{order.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.market?.name} · {order.delivery_type === 'delivery' ? '🚴 Livraison' : '🏪 Retrait'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-sm">{formatPrice(order.total)}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
