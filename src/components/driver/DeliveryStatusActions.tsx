'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, CheckCircle } from 'lucide-react'
import { advanceDeliveryStatus } from '@/app/actions/deliveryActions'

interface Props {
  deliveryId: string
  currentStatus: string
}

const ACTIONS: Record<string, { label: string; icon: typeof Package; color: string }> = {
  assigned: {
    label: 'Confirmer la collecte',
    icon: Package,
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  picked_up: {
    label: 'Confirmer la livraison',
    icon: CheckCircle,
    color: 'bg-primary hover:bg-primary-dark',
  },
}

export default function DeliveryStatusActions({ deliveryId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const action = ACTIONS[currentStatus]
  if (!action) return null

  const Icon = action.icon

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await advanceDeliveryStatus(deliveryId, currentStatus)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-50 ${action.color}`}
    >
      <Icon size={18} />
      {loading ? 'Mise à jour...' : action.label}
    </button>
  )
}
