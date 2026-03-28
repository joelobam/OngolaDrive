'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'ready'
  | 'picked_up' | 'delivering' | 'delivered' | 'cancelled' | 'refunded'

export interface RealtimeOrderState {
  status: OrderStatus
  updatedAt: string
}

/**
 * Souscrit aux changements Realtime d'une commande.
 * Retourne le statut courant mis à jour en live.
 */
export function useRealtimeOrder(orderId: string, initialStatus: OrderStatus) {
  const [state, setState] = useState<RealtimeOrderState>({
    status: initialStatus,
    updatedAt: new Date().toISOString(),
  })

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        payload => {
          const newRecord = payload.new as { status: OrderStatus; updated_at: string }
          setState({
            status: newRecord.status,
            updatedAt: newRecord.updated_at,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return state
}
