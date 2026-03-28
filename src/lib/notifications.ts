import { createClient } from '@supabase/supabase-js'

/**
 * Crée une notification en base directement via le service_role.
 * À utiliser dans les route handlers serveur (webhooks, API routes).
 */
export async function sendNotification({
  userId,
  title,
  body,
  type,
  data = {},
}: {
  userId: string
  title: string
  body: string
  type: 'order_update' | 'order_ready' | 'system'
  data?: Record<string, unknown>
}): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, body, type, data, is_read: false })

  if (error) {
    console.error('[sendNotification] error:', error)
  }
}
