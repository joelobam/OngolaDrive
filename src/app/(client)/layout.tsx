import { createClient } from '@/lib/supabase/server'
import ClientHeader from '@/components/client/ClientHeader'
import ClientNav from '@/components/client/ClientNav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ClientHeader userId={user?.id ?? null} />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <ClientNav />
    </div>
  )
}
