import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, MapPin, Pencil } from 'lucide-react'
import MarketStatusBadge from '@/components/admin/MarketStatusBadge'
import MarketToggleStatus from '@/components/admin/MarketToggleStatus'

export default async function AdminMarketsPage() {
  const supabase = await createClient()
  const { data: markets } = await supabase
    .from('markets')
    .select('id, name, slug, city, address, status, commission_rate, cover_image, created_at')
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string; name: string; slug: string; city: string
        address: string | null; status: string; commission_rate: number
        cover_image: string | null; created_at: string
      }> | null; error: unknown
    }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marchés</h1>
          <p className="text-gray-500 text-sm mt-1">{markets?.length ?? 0} marché(s) enregistré(s)</p>
        </div>
        <Link
          href="/admin/markets/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Nouveau marché
        </Link>
      </div>

      {!markets?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400">Aucun marché créé. Commencez par en créer un.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">Marché</th>
                <th className="px-6 py-3 text-left">Localisation</th>
                <th className="px-6 py-3 text-left">Commission</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Créé le</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {markets.map(market => (
                <tr key={market.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {market.cover_image ? (
                        <img src={market.cover_image} alt={market.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm">
                          {market.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{market.name}</p>
                        <p className="text-xs text-gray-400">{market.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {market.address ? `${market.address}, ` : ''}{market.city}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{market.commission_rate}%</td>
                  <td className="px-6 py-4">
                    <MarketStatusBadge status={market.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(market.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <MarketToggleStatus marketId={market.id} currentStatus={market.status} />
                      <Link
                        href={`/admin/markets/${market.slug}/edit`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
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
