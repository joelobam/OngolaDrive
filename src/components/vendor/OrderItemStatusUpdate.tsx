'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
  pending:   { value: 'confirmed',  label: 'Confirmer' },
  confirmed: { value: 'preparing',  label: 'Commencer préparation' },
  preparing: { value: 'ready',      label: 'Marquer prêt' },
}

export default function OrderItemStatusUpdate({ itemId, currentStatus }: { itemId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const next = NEXT_STATUS[currentStatus]
  if (!next) return null

  const update = async () => {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (createClient().from('order_items') as any).update({ status: next.value }).eq('id', itemId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={update}
      disabled={loading}
      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors whitespace-nowrap"
    >
      {loading ? '...' : next.label}
    </button>
  )
}
