import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import ShopValidationActions from '@/components/admin/ShopValidationActions'
import CreateShopModal from '@/components/admin/CreateShopModal'
import { Store } from 'lucide-react'

type ShopRow = {
  id: string; name: string; slug: string; status: string
  created_at: string; booth_number: string | null
  market: { name: string; city: string } | null
  owner: { full_name: string; phone: string | null } | null
}

const TABS = [
  { key: 'pending', label: 'En attente' },
  { key: 'active', label: 'Actives' },
  { key: 'suspended', label: 'Suspendues' },
]

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'active' } = await searchParams
  const supabase = await createClient()

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [shopsRes, marketsRes, vendorsRes] = await Promise.all([
    svc
      .from('shops')
      .select('id, name, slug, status, created_at, booth_number, market:market_id(name, city), owner:owner_id(full_name, phone)')
      .eq('status', status)
      .order('created_at', { ascending: false }),
    svc.from('markets').select('id, name, city').eq('status', 'active').order('name'),
    svc.from('profiles').select('id, full_name').eq('role', 'vendor').order('full_name'),
  ])

  const shops = shopsRes.data as ShopRow[] | null
  const markets = (marketsRes.data ?? []) as { id: string; name: string; city: string }[]
  const vendors = (vendorsRes.data ?? []) as { id: string; full_name: string }[]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boutiques</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion et validation des boutiques</p>
        </div>
        <CreateShopModal markets={markets} vendors={vendors} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <a
            key={tab.key}
            href={`/admin/shops?status=${tab.key}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              status === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {!shops?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Store size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucune boutique dans cet état.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">Boutique</th>
                <th className="px-6 py-3 text-left">Marché</th>
                <th className="px-6 py-3 text-left">Vendeur</th>
                <th className="px-6 py-3 text-left">Kiosque</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Produits</th>
                {status === 'pending' && <th className="px-6 py-3 text-right">Validation</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shops.map(shop => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{shop.name}</p>
                    <p className="text-xs text-gray-400">{shop.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {shop.market?.name ?? '—'}
                    <span className="text-xs text-gray-400 ml-1">({shop.market?.city})</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{shop.owner?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{shop.owner?.phone ?? ''}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{shop.booth_number ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/admin/shops/${shop.id}/products`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary-light rounded-lg hover:bg-primary-light/70 transition-colors"
                    >
                      Produits →
                    </a>
                  </td>
                  {status === 'pending' && (
                    <td className="px-6 py-4">
                      <ShopValidationActions shopId={shop.id} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
