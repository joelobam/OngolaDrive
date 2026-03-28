'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { data: me } = await supabase
    .from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null; error: unknown }
  if (!['super_admin', 'market_admin'].includes(me?.role ?? '')) throw new Error('Accès refusé')
}

export async function createShopAsAdmin(formData: {
  name: string
  slug: string
  description: string
  market_id: string
  owner_id: string
  booth_number: string
  phone: string
}) {
  await assertAdmin()

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await (svc.from('shops') as any).insert({
    name: formData.name,
    slug: formData.slug,
    description: formData.description || null,
    market_id: formData.market_id,
    owner_id: formData.owner_id,
    booth_number: formData.booth_number || null,
    phone: formData.phone || null,
    status: 'active',
    is_open: false,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/shops')
}
