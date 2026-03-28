import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Tag } from 'lucide-react'
import CategoryForm from '@/components/admin/CategoryForm'
import CategoryActions from '@/components/admin/CategoryActions'

type CategoryRow = {
  id: string; name: string; slug: string; icon: string | null
  sort_order: number; is_active: boolean
  market: { name: string } | null
}

function getSvc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AdminCategoriesPage() {
  const svc = getSvc()

  const [categoriesRes, marketsRes] = await Promise.all([
    svc.from('categories')
      .select('id, name, slug, icon, sort_order, is_active, market:market_id(name)')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    svc.from('markets').select('id, name').eq('status', 'active').order('name'),
  ])

  const categories = (categoriesRes.data ?? []) as unknown as CategoryRow[]
  const markets = (marketsRes.data ?? []) as { id: string; name: string }[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
        <p className="text-gray-500 text-sm mt-1">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Formulaire création */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 self-start">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Tag size={16} className="text-primary" />
            Nouvelle catégorie
          </h2>
          <CategoryForm markets={markets} />
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden self-start">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Catégories existantes</h2>
          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Tag size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Aucune catégorie</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {categories.map(cat => (
                <li key={cat.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-3">
                    {cat.icon && (
                      <span className="text-lg leading-none">{cat.icon}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                      <p className="text-xs text-gray-400">
                        {cat.market?.name ?? 'Global'} · ordre {cat.sort_order}
                      </p>
                    </div>
                  </div>
                  <CategoryActions categoryId={cat.id} isActive={cat.is_active} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
