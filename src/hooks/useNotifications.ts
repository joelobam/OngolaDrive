'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AppNotification {
  id: string
  title: string
  body: string
  type: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Chargement initial
  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('notifications') as any)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30) as { data: AppNotification[] | null; error: unknown }

      setNotifications(data ?? [])
      setLoading(false)
    }

    fetchNotifications()
  }, [userId])

  // Souscription Realtime aux nouvelles notifications
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          const newNotif = payload.new as AppNotification
          setNotifications(prev => [newNotif, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markAsRead = useCallback(async (notifId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('id', notifId)

    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }, [userId])

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}
