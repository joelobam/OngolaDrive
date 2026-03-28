import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Store, Package, Search } from 'lucide-react'
import SearchInput from '@/components/client/SearchInput'
import { formatPrice } from '@/lib/utils'

type ShopResult = {
  id: string; name: string; slug: string; description: string | null
  logo_url: string | null; is_open: boolean
  market: { name: string; slug: string } | null
}

type ProductResult = {
  id: string; name: string; slug: string; price: number; unit: string
  images: string[]; is_available: boolean
  shop: { name: string; slug: string; market: { slug: string } | null } | null
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const query = q.trim()

  let shops: ShopResult[] = []
  let products: ProductResult[] = []

  if (query.length >= 2) {
    const supabase = await createClient()
    const pattern = `%${query}%`

    const [shopsRes, productsRes] = await Promise.all([
      supabase
        .from('shops')
        .select('id, name, slug, description, logo_url, is_open, market:market_id(name, slug)')
        .eq('status', 'active')
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .order('is_open', { ascending: false })
        .limit(10),
      supabase
        .from('products')
        .select('id, name, slug, price, unit, images, is_available, shop:shop_id(name, slug, market:market_id(slug))')
        .eq('status', 'active')
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(20),
    ])

    shops = (shopsRes.data ?? []) as unknown as ShopResult[]
    products = (productsRes.data ?? []) as unknown as ProductResult[]
  }

  const hasResults = shops.length > 0 || products.length > 0

  return (
    <div className="px-4 py-4">
      <SearchInput defaultValue={query} />

      {!query || query.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">Tapez au moins 2 caractères pour rechercher</p>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucun résultat pour « {query} »</p>
          <p className="text-gray-400 text-sm mt-1">Essayez avec d&apos;autres mots-clés</p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {/* Boutiques */}
          {shops.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Store size={15} className="text-primary" />
                Boutiques ({shops.length})
              </h2>
              <div className="space-y-2">
                {shops.map(shop => (
                  <Link
                    key={shop.id}
                    href={`/markets/${shop.market?.slug}/shops/${shop.slug}`}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {shop.logo_url ? (
                        <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-lg">{shop.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{shop.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {shop.market?.name} ·{' '}
                        <span className={shop.is_open ? 'text-primary' : 'text-gray-400'}>
                          {shop.is_open ? 'Ouverte' : 'Fermée'}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Produits */}
          {products.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Package size={15} className="text-primary" />
                Produits ({products.length})
              </h2>
              <div className="space-y-2">
                {products.map(product => {
                  const marketSlug = product.shop?.market?.slug
                  const shopSlug = product.shop?.slug
                  const href = marketSlug && shopSlug
                    ? `/markets/${marketSlug}/shops/${shopSlug}`
                    : '#'

                  return (
                    <Link
                      key={product.id}
                      href={href}
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 truncate">{product.shop?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-800">{formatPrice(product.price)}</p>
                        <p className="text-xs text-gray-400">{product.unit}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
