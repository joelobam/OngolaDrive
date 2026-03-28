'use client'

import { useEffect, useRef } from 'react'
import { ShoppingBag, X } from 'lucide-react'
import { useRealtimeVendorOrders } from '@/hooks/useRealtimeVendorOrders'

interface Props {
  shopId: string
}

export default function NewOrderToast({ shopId }: Props) {
  const { alerts, dismissAlert } = useRealtimeVendorOrders(shopId)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevCountRef = useRef(0)

  // Jouer un son à chaque nouvelle alerte
  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      audioRef.current?.play().catch(() => {/* autoplay bloqué */})
    }
    prevCountRef.current = alerts.length
  }, [alerts.length])

  if (alerts.length === 0) return null

  return (
    <>
      {/* Son de notification (optionnel) */}
      <audio ref={audioRef} src="/sounds/new-order.mp3" preload="auto" />

      {/* Stack de toasts en bas à droite */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-green-200 rounded-2xl shadow-xl px-4 py-3 w-80 animate-slide-in"
          >
            <div className="flex-shrink-0 w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingBag size={18} className="text-green-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                Nouvelle commande {alert.orderNumber}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {alert.quantity}× {alert.productName}
              </p>
              <p className="text-xs font-medium text-green-600 mt-0.5">
                {alert.subtotal.toLocaleString('fr-CM')} FCFA
              </p>
            </div>

            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
