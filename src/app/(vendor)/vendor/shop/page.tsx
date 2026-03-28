import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShopForm from '@/components/vendor/ShopForm'
import ShopOpenToggle from '@/components/vendor/ShopOpenToggle'
import MarketStatusBadge from '@/components/admin/MarketStatusBadge'

type ShopData = {
  id: string; name: string; slug: string; description: string | null
  phone: string | null; booth_number: string | null; status: string
  is_open: boolean; market: { name: string; city: string } | null
}

export default async function VendorShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: markets } = await supabase
    .from('markets')
    .select('id, name, city')
    .eq('status', 'active') as { data: Array<{ id: string; name: string; city: string }> | null; error: unknown }

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, description, phone, booth_number, status, is_open, market:market_id(name, city)')
    .eq('owner_id', user.id)
    .single() as { data: ShopData | null; error: unknown }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ma boutique</h1>
        <p className="text-gray-500 text-sm mt-1">
          {shop ? 'Gérez les informations de votre boutique' : 'Créez votre boutique pour commencer à vendre'}
        </p>
      </div>

      {shop && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-gray-800">{shop.name}</h2>
              <MarketStatusBadge status={shop.status} />
            </div>
            <p className="text-sm text-gray-500">
              {shop.market?.name} — {shop.market?.city}
              {shop.booth_number && ` · Kiosque ${shop.booth_number}`}
            </p>
          </div>
          {shop.status === 'active' && (
            <ShopOpenToggle shopId={shop.id} isOpen={shop.is_open} />
          )}
          {shop.status === 'pending' && (
            <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
              En attente de validation par l&apos;admin
            </span>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-6">{shop ? 'Modifier les informations' : 'Créer ma boutique'}</h2>
        <ShopForm shop={shop} markets={markets ?? []} ownerId={user.id} />
      </div>
    </div>
  )
}
