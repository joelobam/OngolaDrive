import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Database } from '@/types/database'

type Market = Database['public']['Tables']['markets']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: markets } = await supabase
    .from('markets')
    .select('*')
    .eq('status', 'active')
    .order('name') as { data: Market[] | null; error: unknown }

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Marchés disponibles</h2>

      {!markets?.length ? (
        <p className="text-gray-400 text-sm text-center mt-12">Aucun marché disponible pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {markets.map(market => (
            <Link
              key={market.id}
              href={`/markets/${market.slug}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {market.cover_image && (
                <div className="h-36 bg-gray-100">
                  <img src={market.cover_image} alt={market.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{market.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={13} />
                  {market.address ?? ''} {market.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
