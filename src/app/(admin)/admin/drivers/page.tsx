import { createClient } from '@/lib/supabase/server'
import DriverToggleActive from '@/components/admin/DriverToggleActive'
import { UserPlus } from 'lucide-react'
import { getInitials } from '@/lib/utils'

type DriverRow = {
  id: string; full_name: string; phone: string | null
  avatar_url: string | null; is_active: boolean; created_at: string
}

export default async function AdminDriversPage() {
  const supabase = await createClient()

  const { data: drivers } = await supabase
    .from('profiles')
    .select('id, full_name, phone, avatar_url, is_active, created_at')
    .eq('role', 'delivery_agent')
    .order('created_at', { ascending: false }) as { data: DriverRow[] | null; error: unknown }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livreurs</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers?.length ?? 0} livreur(s) enregistré(s)</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
          <UserPlus size={16} />
          Inviter un livreur
        </button>
      </div>

      {!drivers?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400">Aucun livreur enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="px-6 py-3 text-left">Livreur</th>
                <th className="px-6 py-3 text-left">Téléphone</th>
                <th className="px-6 py-3 text-left">Inscrit le</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {driver.avatar_url ? (
                        <img src={driver.avatar_url} alt={driver.full_name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                          {getInitials(driver.full_name)}
                        </div>
                      )}
                      <p className="font-medium text-gray-800">{driver.full_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{driver.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(driver.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      driver.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {driver.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <DriverToggleActive driverId={driver.id} isActive={driver.is_active} />
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
