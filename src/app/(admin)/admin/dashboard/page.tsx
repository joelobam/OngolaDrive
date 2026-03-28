import { createClient } from '@/lib/supabase/server'
import { Store, ShoppingBag, ShoppingCart, Users, TrendingUp, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

async function getStats() {
  const supabase = await createClient()

  const [markets, shops, orders, users, revenue, pendingShops] = await Promise.all([
    supabase.from('markets').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('orders') as any).select('total').in('status', ['delivered', 'confirmed', 'preparing', 'delivering']),
    supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const totalRevenue = ((revenue.data ?? []) as Array<{ total: number }>).reduce((sum, o) => sum + (o.total ?? 0), 0)

  return {
    markets: markets.count ?? 0,
    shops: shops.count ?? 0,
    orders: orders.count ?? 0,
    users: users.count ?? 0,
    revenue: totalRevenue,
    pendingShops: pendingShops.count ?? 0,
  }
}

async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, market_id')
    .order('created_at', { ascending: false })
    .limit(5) as { data: Array<{ id: string; order_number: string; status: string; total: number; created_at: string; market_id: string }> | null; error: unknown }
  return data ?? []
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered: 'bg-primary-light text-primary-dark',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  picked_up: 'Récupérée',
  delivering: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  const cards = [
    { label: 'Marchés actifs', value: stats.markets, icon: Store, color: 'text-primary', bg: 'bg-primary-50' },
    { label: 'Boutiques actives', value: stats.shops, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Commandes totales', value: stats.orders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Chiffre d\'affaires', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Boutiques en attente', value: stats.pendingShops, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme OngolaDrive</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-lg`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Commandes récentes</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">Aucune commande pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">N° commande</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-800">{order.order_number}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-gray-800">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
