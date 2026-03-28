import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Star, Clock } from 'lucide-react'

type Market = {
  id: string; name: string; slug: string; description: string | null
  city: string; address: string | null; cover_image: string | null
}
type Shop = {
  id: string; name: string; slug: string; description: string | null
  logo_url: string | null; cover_image: string | null
  rating: number; review_count: number; is_open: boolean; booth_number: string | null
}

export default async function MarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: market } = await supabase
    .from('markets')
    .select('id, name, slug, description, city, address, cover_image')
    .eq('slug', slug)
    .eq('status', 'active')
    .single() as { data: Market | null; error: unknown }

  if (!market) notFound()

  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug, description, logo_url, cover_image, rating, review_count, is_open, booth_number')
    .eq('market_id', market.id)
    .eq('status', 'active')
    .order('is_open', { ascending: false })
    .order('rating', { ascending: false }) as { data: Shop[] | null; error: unknown }

  return (
    <div>
      {/* Header marché */}
      <div className="relative h-40 bg-green-600 mb-4">
        {market.cover_image && (
          <img src={market.cover_image} alt={market.name} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 text-white">
          <h1 className="text-xl font-bold">{market.name}</h1>
          <p className="text-sm opacity-90 flex items-center gap-1 mt-0.5">
            <MapPin size={13} />
            {market.address ? `${market.address}, ` : ''}{market.city}
          </p>
        </div>
      </div>

      <div className="px-4 pb-6">
        {market.description && (
          <p className="text-sm text-gray-500 mb-4">{market.description}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">{shops?.length ?? 0} boutique(s)</h2>
        </div>

        {!shops?.length ? (
          <p className="text-gray-400 text-sm text-center mt-12">Aucune boutique disponible.</p>
        ) : (
          <div className="space-y-3">
            {shops.map(shop => (
              <Link
                key={shop.id}
                href={`/markets/${slug}/shops/${shop.slug}`}
                className="flex gap-3 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {shop.logo_url || shop.cover_image ? (
                    <img src={shop.logo_url ?? shop.cover_image!} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-600 font-bold text-xl">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{shop.name}</h3>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${shop.is_open ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  {shop.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{shop.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {shop.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                        <Star size={11} fill="currentColor" />
                        {shop.rating.toFixed(1)} ({shop.review_count})
                      </span>
                    )}
                    {shop.booth_number && (
                      <span className="text-xs text-gray-400">Kiosque {shop.booth_number}</span>
                    )}
                    <span className={`text-xs ${shop.is_open ? 'text-green-600' : 'text-gray-400'}`}>
                      <Clock size={10} className="inline mr-0.5" />
                      {shop.is_open ? 'Ouverte' : 'Fermée'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
