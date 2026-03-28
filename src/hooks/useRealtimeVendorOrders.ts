'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface NewOrderAlert {
  id: string
  orderNumber: string
  productName: string
  quantity: number
  subtotal: number
  receivedAt: string
}

/**
 * Souscrit aux nouveaux order_items de la boutique du vendeur.
 * Retourne les alertes de nouvelles commandes (max 5 dernières).
 */
export function useRealtimeVendorOrders(shopId: string) {
  const [alerts, setAlerts] = useState<NewOrderAlert[]>([])

  useEffect(() => {
    if (!shopId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`vendor-orders:${shopId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_items',
          filter: `shop_id=eq.${shopId}`,
        },
        payload => {
          const item = payload.new as {
            id: string; product_name: string; quantity: number; subtotal: number; order_id: string
          }
          setAlerts(prev => [
            {
              id: item.id,
              orderNumber: `#${item.order_id.slice(0, 8).toUpperCase()}`,
              productName: item.product_name,
              quantity: item.quantity,
              subtotal: item.subtotal,
              receivedAt: new Date().toISOString(),
            },
            ...prev.slice(0, 4),
          ])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shopId])

  const dismissAlert = (id: string) =>
    setAlerts(prev => prev.filter(a => a.id !== id))

  return { alerts, dismissAlert }
}
