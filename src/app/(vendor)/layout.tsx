import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VendorSidebar from '@/components/vendor/VendorSidebar'
import NewOrderToast from '@/components/vendor/NewOrderToast'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single() as { data: { role: string; full_name: string; avatar_url: string | null } | null; error: unknown }

  if (!profile || profile.role !== 'vendor') redirect('/dashboard')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, is_open, status')
    .eq('owner_id', user.id)
    .single() as { data: { id: string; name: string; is_open: boolean; status: string } | null; error: unknown }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <VendorSidebar
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        shopName={shop?.name ?? null}
        shopStatus={shop?.status ?? null}
        isOpen={shop?.is_open ?? false}
      />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
      {shop && <NewOrderToast shopId={shop.id} />}
    </div>
  )
}
