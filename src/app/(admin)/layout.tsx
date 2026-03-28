import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string; avatar_url: string | null } | null; error: unknown }

  if (!profile || !['super_admin', 'market_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar role={profile.role} fullName={profile.full_name} avatarUrl={profile.avatar_url} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
