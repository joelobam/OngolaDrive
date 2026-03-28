import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, ShoppingCart, TrendingUp, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
  ready: 'Prête', picked_up: 'Récupérée', delivering: 'En livraison',
  delivered: 'Livrée', cancelled: 'Annulée',
}
const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700', ready: 'bg-indigo-100 text-indigo-700',
  delivering: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, rating, review_count')
    .eq('owner_id', user.id)
    .single() as { data: { id: string; name: string; rating: number; review_count: number } | null; error: unknown }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore de boutique.</p>
        <Link href="/vendor/shop" className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
          Créer ma boutique
        </Link>
      </div>
    )
  }

  const [products, orders, revenue] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'active'),
    supabase.from('order_items').select('order_id', { count: 'exact', head: true }).eq('shop_id', shop.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('order_items') as any).select('subtotal').eq('shop_id', shop.id),
  ])

  const totalRevenue = ((revenue.data ?? []) as Array<{ subtotal: number }>)
    .reduce((sum: number, r: { subtotal: number }) => sum + r.subtotal, 0)

  const { data: recentOrders } = await supabase
    .from('order_items')
    .select('id, order_id, product_name, quantity, unit_price, subtotal, status, orders:order_id(order_number, created_at)')
    .eq('shop_id', shop.id)
    .order('order_id', { ascending: false })
    .limit(5) as {
      data: Array<{
        id: string; order_id: string; product_name: string; quantity: number
        unit_price: number; subtotal: number; status: string
        orders: { order_number: string; created_at: string } | null
      }> | null; error: unknown
    }

  const cards = [
    { label: 'Produits actifs', value: products.count ?? 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Commandes reçues', value: orders.count ?? 0, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Chiffre d\'affaires', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Note moyenne', value: shop.rating > 0 ? `${shop.rating.toFixed(1)} / 5` : '—', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{shop.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
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

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Dernières commandes</h2>
          <Link href="/vendor/orders" className="text-sm text-green-600 hover:underline">Voir tout</Link>
        </div>
        {!recentOrders?.length ? (
          <p className="text-gray-400 text-sm text-center py-12">Aucune commande reçue.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">Commande</th>
                <th className="px-6 py-3 text-left">Produit</th>
                <th className="px-6 py-3 text-left">Qté</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{item.orders?.order_number ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-600 truncate max-w-32">{item.product_name}</td>
                  <td className="px-6 py-3 text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-gray-800">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
