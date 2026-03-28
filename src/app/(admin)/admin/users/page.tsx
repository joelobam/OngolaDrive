import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Users, ShieldCheck } from 'lucide-react'
import UserRoleSelect from '@/components/admin/UserRoleSelect'
import CreateUserModal from '@/components/admin/CreateUserModal'

type UserRow = {
  id: string
  full_name: string
  phone: string | null
  role: string
  created_at: string
  avatar_url: string | null
}


const ROLES = ['all', 'customer', 'vendor', 'delivery_agent', 'market_admin', 'super_admin']
const ROLE_TAB_LABELS: Record<string, string> = {
  all: 'Tous',
  customer: 'Clients',
  vendor: 'Vendeurs',
  delivery_agent: 'Livreurs',
  market_admin: 'Admins',
  super_admin: 'Super Admin',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>
}) {
  const { role = 'all', q = '' } = await searchParams

  // service_role pour lire tous les profils
  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = svc
    .from('profiles')
    .select('id, full_name, phone, role, created_at, avatar_url')
    .order('created_at', { ascending: false })
    .limit(100)

  if (role !== 'all') {
    query = query.eq('role', role)
  }

  if (q.trim()) {
    query = query.ilike('full_name', `%${q.trim()}%`)
  }

  const { data: users } = await query as { data: UserRow[] | null; error: unknown }

  const supabase = await createClient()
  const { data: { user: me } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">Liste de tous les comptes inscrits</p>
        </div>
        <CreateUserModal />
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Tabs rôle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto flex-shrink-0">
          {ROLES.map(r => (
            <a
              key={r}
              href={`/admin/users?role=${r}${q ? `&q=${q}` : ''}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                role === r
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {ROLE_TAB_LABELS[r]}
            </a>
          ))}
        </div>

        {/* Recherche */}
        <form method="GET" action="/admin/users" className="flex gap-2">
          <input type="hidden" name="role" value={role} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher un nom..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Rechercher
          </button>
        </form>
      </div>

      {!users?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{users.length} résultat{users.length > 1 ? 's' : ''}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">Utilisateur</th>
                <th className="px-6 py-3 text-left">Téléphone</th>
                <th className="px-6 py-3 text-left">Rôle</th>
                <th className="px-6 py-3 text-left">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.id === me?.id ? 'bg-primary-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-500">
                            {user.full_name?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 flex items-center gap-1">
                          {user.full_name || '—'}
                          {user.id === me?.id && (
                            <ShieldCheck size={13} className="text-primary" />
                          )}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.phone ?? '—'}</td>
                  <td className="px-6 py-4">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      isSelf={user.id === me?.id}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
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
