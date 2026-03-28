import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Star, Clock, MapPin } from 'lucide-react'
import ProductCard from '@/components/client/ProductCard'

type Shop = {
  id: string; name: string; slug: string; description: string | null
  cover_image: string | null; logo_url: string | null; phone: string | null
  booth_number: string | null; is_open: boolean; rating: number; review_count: number
  market: { id: string; name: string; slug: string } | null
}
type Product = {
  id: string; name: string; price: number; compare_price: number | null
  images: string[]; unit: string; stock: number | null; status: string
  description: string | null; category: { name: string } | null
}
type Category = { id: string; name: string }

export default async function ShopPage({ params }: { params: Promise<{ slug: string; shopSlug: string }> }) {
  const { slug, shopSlug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, description, cover_image, logo_url, phone, booth_number, is_open, rating, review_count, market:market_id(id, name, slug)')
    .eq('slug', shopSlug)
    .eq('status', 'active')
    .single() as { data: Shop | null; error: unknown }

  if (!shop) notFound()

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, compare_price, images, unit, stock, status, description, category:category_id(name)')
      .eq('shop_id', shop.id)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('name'),
    supabase
      .from('categories')
      .select('id, name')
      .eq('market_id', (shop.market as { id: string } | null)?.id ?? '')
      .eq('is_active', true)
      .order('name'),
  ])

  const products = productsRes.data as Product[] | null
  const categories = categoriesRes.data as Category[] | null

  // Grouper les produits par catégorie
  const grouped: Record<string, Product[]> = {}
  const uncategorized: Product[] = []

  for (const product of products ?? []) {
    const cat = product.category?.name
    if (cat) {
      grouped[cat] = grouped[cat] ?? []
      grouped[cat].push(product)
    } else {
      uncategorized.push(product)
    }
  }
  if (uncategorized.length) grouped['Autres'] = uncategorized

  return (
    <div>
      {/* Header boutique */}
      <div className="relative h-36 bg-gray-200">
        {shop.cover_image && (
          <img src={shop.cover_image} alt={shop.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <div className="flex items-end gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow overflow-hidden">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary font-bold text-xl">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-lg font-bold text-white drop-shadow">{shop.name}</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-1 ${shop.is_open ? 'text-primary' : 'text-gray-400'}`}>
              <Clock size={13} />
              {shop.is_open ? 'Ouverte' : 'Fermée'}
            </span>
            {shop.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <Star size={13} fill="currentColor" />
                {shop.rating.toFixed(1)} ({shop.review_count} avis)
              </span>
            )}
            {shop.booth_number && (
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin size={13} />
                Kiosque {shop.booth_number}
              </span>
            )}
          </div>
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className="text-sm text-primary font-medium">{shop.phone}</a>
          )}
        </div>

        {shop.description && (
          <p className="text-sm text-gray-500 mb-4">{shop.description}</p>
        )}

        {!products?.length ? (
          <p className="text-gray-400 text-sm text-center mt-12">Aucun produit disponible.</p>
        ) : (
          <div className="space-y-6 pb-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{category}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {items.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      shopId={shop.id}
                      marketId={(shop.market as { id: string } | null)?.id ?? ''}
                      marketSlug={slug}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
