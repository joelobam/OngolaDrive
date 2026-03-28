import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * POST /api/notifications/send
 * Corps attendu :
 * {
 *   userId: string        – destinataire
 *   title: string
 *   body: string
 *   type: 'order_update' | 'order_ready' | 'system'
 *   data?: Record<string, unknown>   – ex: { order_id: '...' }
 * }
 *
 * Protégé par un secret interne (INTERNAL_API_SECRET) pour éviter tout
 * appel externe non autorisé. Les routes internes (webhook CinetPay,
 * changements de statut) passent ce secret dans le header Authorization.
 */
export async function POST(req: NextRequest) {
  // Vérification du secret interne
  const authHeader = req.headers.get('authorization')
  const expectedSecret = `Bearer ${process.env.INTERNAL_API_SECRET}`

  if (!process.env.INTERNAL_API_SECRET || authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    userId: string
    title: string
    body: string
    type: string
    data?: Record<string, unknown>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, title, body: notifBody, type, data } = body

  if (!userId || !title || !notifBody || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Utiliser le service_role pour contourner RLS
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body: notifBody,
      type,
      data: data ?? {},
      is_read: false,
    })

  if (error) {
    console.error('[notifications/send] insert error:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
