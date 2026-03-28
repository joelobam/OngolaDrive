import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DriverNav from '@/components/driver/DriverNav'

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, is_active')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string; is_active: boolean } | null; error: unknown }

  if (!profile || profile.role !== 'delivery_agent') redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-primary">OngolaDrive</h1>
          <p className="text-xs text-gray-400">Espace livreur</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-primary-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">{profile.full_name}</span>
        </div>
      </header>
      <main className="flex-1 pb-20">{children}</main>
      <DriverNav />
    </div>
  )
}
