'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ALLOWED_ROLES = ['customer', 'vendor', 'delivery_agent', 'market_admin', 'super_admin']

function getSvc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { data: me } = await supabase
    .from('profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null; error: unknown }
  if (me?.role !== 'super_admin') throw new Error('Accès refusé')
  return user
}

export async function createUser(formData: {
  email: string
  password: string
  full_name: string
  phone: string
  role: string
}) {
  await assertSuperAdmin()
  if (!ALLOWED_ROLES.includes(formData.role)) throw new Error('Rôle invalide')

  const svc = getSvc()

  // Créer l'utilisateur Auth
  const { data: created, error: authError } = await svc.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
  })
  if (authError) throw new Error(authError.message)

  // Mettre à jour le profil
  const { error: profileError } = await (svc.from('profiles') as any)
    .update({ full_name: formData.full_name, phone: formData.phone || null, role: formData.role })
    .eq('id', created.user.id)
  if (profileError) throw new Error(profileError.message)

  revalidatePath('/admin/users')
}

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
