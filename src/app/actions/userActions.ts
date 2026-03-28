'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ALLOWED_ROLES = ['customer', 'vendor', 'delivery_agent', 'market_admin', 'super_admin']

export async function updateUserRole(userId: string, newRole: string) {
  if (!ALLOWED_ROLES.includes(newRole)) throw new Error('Rôle invalide')

  // Vérifier que l'appelant est super_admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (me?.role !== 'super_admin') throw new Error('Accès refusé')

  // Empêcher de se rétrograder soi-même
  if (userId === user.id && newRole !== 'super_admin') throw new Error('Vous ne pouvez pas modifier votre propre rôle')

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await (svc.from('profiles') as any)
    .update({ role: newRole })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
}
