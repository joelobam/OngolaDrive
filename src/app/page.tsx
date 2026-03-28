import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'role'>

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Profile | null; error: unknown }

  const role = profile?.role ?? 'customer'

  if (role === 'super_admin') redirect('/admin/dashboard')
  if (role === 'market_admin') redirect('/admin/dashboard')
  if (role === 'vendor') redirect('/vendor/dashboard')
  if (role === 'delivery_agent') redirect('/driver/deliveries')
  redirect('/dashboard')
}
