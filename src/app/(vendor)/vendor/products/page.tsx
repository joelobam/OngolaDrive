import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import ProductAvailabilityToggle from '@/components/vendor/ProductAvailabilityToggle'

type Product = {
  id: string; name: string; price: number; compare_price: number | null
  stock: number | null; status: string; is_featured: boolean
  images: string[]; category: { name: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active:       { label: 'Disponible',   className: 'bg-green-100 text-green-700' },
  inactive:     { label: 'Désactivé',    className: 'bg-gray-100 text-gray-500' },
  out_of_stock: { label: 'Rupture',      className: 'bg-red-100 text-red-600' },
}

export default async function VendorProductsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'all' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_id', user.id).single() as { data: { id: string } | null; error: unknown }

  if (!shop) redirect('/vendor/shop')

  let query = supabase
    .from('products')
    .select('id, name, price, compare_price, stock, status, is_featured, images, category:category_id(name)')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products } = await (query as any) as { data: Product[] | null; error: unknown }

  const TABS = [
    { key: 'all', label: 'Tous' },
    { key: 'active', label: 'Disponibles' },
    { key: 'out_of_stock', label: 'Rupture' },
    { key: 'inactive', label: 'Désactivés' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500 text-sm mt-1">{products?.length ?? 0} produit(s)</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Ajouter un produit
        </Link>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <a key={tab.key} href={`/vendor/products?status=${tab.key}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              status === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{tab.label}</a>
        ))}
      </div>

      {!products?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 mb-4">Aucun produit trouvé.</p>
          <Link href="/vendor/products/new" className="text-green-600 text-sm hover:underline">Ajouter votre premier produit</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">Produit</th>
                <th className="px-6 py-3 text-left">Catégorie</th>
                <th className="px-6 py-3 text-left">Prix</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        {product.is_featured && <span className="text-xs text-yellow-600">⭐ En vedette</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.category?.name ?? '—'}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{formatPrice(product.price)}</p>
                    {product.compare_price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.stock === null ? '∞' : product.stock}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(STATUS_CONFIG[product.status] ?? { className: 'bg-gray-100 text-gray-500' }).className}`}>
                      {(STATUS_CONFIG[product.status] ?? { label: product.status }).label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <ProductAvailabilityToggle productId={product.id} currentStatus={product.status} />
                      <Link href={`/vendor/products/${product.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Pencil size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
