'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Package, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string }> = {
  order_update: { icon: Package,       color: 'text-blue-500' },
  order_ready:  { icon: CheckCircle2,  color: 'text-primary' },
  system:       { icon: AlertCircle,   color: 'text-gray-400' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

interface Props {
  userId: string
}

export default function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId)

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = async (notif: typeof notifications[0]) => {
    await markAsRead(notif.id)
    setOpen(false)

    // Navigation contextuelle selon le type
    if (notif.type === 'order_update' && notif.data?.order_id) {
      router.push(`/orders/${notif.data.order_id}`)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Tout marquer lu
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => {
                const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system
                const Icon = config.icon
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                      !notif.is_read && 'bg-primary-50/50'
                    )}
                  >
                    <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', notif.is_read ? 'text-gray-600' : 'text-gray-800 font-medium')}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{notif.body}</p>
                      <p className="text-xs text-gray-300 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
