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
  if (!formData.email || !formData.password) throw new Error('Email et mot de passe requis')
  if (formData.password.length < 8) throw new Error('Le mot de passe doit faire au moins 8 caractères')

  const svc = getSvc()

  // 1. Créer le compte Auth
  const { data: created, error: authError } = await svc.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { full_name: formData.full_name },
  })

  if (authError) throw new Error(`Erreur Auth : ${authError.message}`)
  if (!created?.user?.id) throw new Error('Utilisateur non créé — réponse inattendue de Supabase')

  // 2. Créer/mettre à jour le profil (upsert au cas où le trigger tarde)
  const { error: profileError } = await (svc.from('profiles') as any)
    .upsert({
      id: created.user.id,
      full_name: formData.full_name,
      phone: formData.phone || null,
      role: formData.role,
    })

  if (profileError) throw new Error(`Profil non mis à jour : ${profileError.message}`)

  revalidatePath('/admin/users')
  return { userId: created.user.id }
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
