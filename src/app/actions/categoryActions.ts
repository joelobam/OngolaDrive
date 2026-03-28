'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getSvc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { data: me } = await supabase
    .from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null; error: unknown }
  if (!['super_admin', 'market_admin'].includes(me?.role ?? '')) throw new Error('Accès refusé')
}

export async function createCategory(formData: {
  name: string
  slug: string
  market_id: string | null
  icon: string
  sort_order: number
}) {
  await assertAdmin()
  const { error } = await (getSvc().from('categories') as any).insert({
    name: formData.name,
    slug: formData.slug,
    market_id: formData.market_id || null,
    icon: formData.icon || null,
    sort_order: formData.sort_order,
    is_active: true,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  await assertAdmin()
  const { error } = await (getSvc().from('categories') as any)
    .update({ is_active: !isActive })
    .eq('id', categoryId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteCategory(categoryId: string) {
  await assertAdmin()
  const { error } = await (getSvc().from('categories') as any)
    .delete()
    .eq('id', categoryId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}
