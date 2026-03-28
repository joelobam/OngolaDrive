import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function DriverProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, avatar_url, is_active, created_at')
    .eq('id', user.id)
    .single() as {
      data: { full_name: string; phone: string | null; avatar_url: string | null; is_active: boolean; created_at: string } | null
      error: unknown
    }

  if (!profile) redirect('/login')

  // Stats
  const [total, delivered] = await Promise.all([
    supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('driver_id', user.id),
    supabase.from('deliveries').select('id', { count: 'exact', head: true }).eq('driver_id', user.id).eq('status', 'delivered'),
  ])

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mon profil</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 flex items-center gap-4">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
            {getInitials(profile.full_name)}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-gray-800">{profile.full_name}</p>
          <p className="text-sm text-gray-400">{profile.phone ?? user.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {profile.is_active
              ? <><CheckCircle size={14} className="text-primary" /><span className="text-xs text-primary">Compte actif</span></>
              : <><XCircle size={14} className="text-gray-400" /><span className="text-xs text-gray-400">Compte inactif</span></>
            }
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total.count ?? 0}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total livraisons</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{delivered.count ?? 0}</p>
          <p className="text-sm text-gray-500 mt-0.5">Complétées</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-500">
        <p>Membre depuis le {new Date(profile.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  )
}
