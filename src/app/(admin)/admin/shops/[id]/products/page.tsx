import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'
import AdminProductForm from '@/components/admin/AdminProductForm'

type Product = {
  id: string; name: string; slug: string; price: number
  unit: string; status: string; is_available: boolean
  stock: number | null; category: { name: string } | null
}

function getSvc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AdminShopProductsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: shopId } = await params
  const svc = getSvc()

  const [shopRes, productsRes, categoriesRes] = await Promise.all([
    svc.from('shops').select('id, name, market:market_id(name)').eq('id', shopId).single(),
    svc.from('products')
      .select('id, name, slug, price, unit, status, is_available, stock, category:category_id(name)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false }),
    svc.from('categories').select('id, name').order('name'),
  ])

  const shop = shopRes.data as { id: string; name: string; market: { name: string } | null } | null
  if (!shop) notFound()

  const products = (productsRes.data ?? []) as unknown as Product[]
  const categories = (categoriesRes.data ?? []) as { id: string; name: string }[]

  return (
    <div>
      <Link href="/admin/shops" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
        <ChevronLeft size={15} /> Boutiques
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {shop.market?.name} · {products.length} produit{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Formulaire ajout */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Package size={16} className="text-primary" />
            Ajouter un produit
          </h2>
          <AdminProductForm shopId={shopId} categories={categories} />
        </div>

        {/* Liste produits */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden self-start">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Produits existants</h2>
          </div>

          {products.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Aucun produit</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {products.map(p => (
                <li key={p.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.category?.name ?? 'Sans catégorie'} · {p.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-gray-700">
                      {p.price.toLocaleString('fr-CM')} F
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.is_available ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {p.is_available ? 'Dispo' : 'Indispo'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
