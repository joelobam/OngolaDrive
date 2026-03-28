'use client'

import { useRealtimeOrder, type OrderStatus } from '@/hooks/useRealtimeOrder'
import { CheckCircle2, Clock, Truck, ShoppingBag } from 'lucide-react'

const DELIVERY_STEPS: Array<{ key: OrderStatus; label: string; icon: typeof CheckCircle2 }> = [
  { key: 'pending',    label: 'Commande reçue',  icon: CheckCircle2 },
  { key: 'confirmed',  label: 'Confirmée',        icon: CheckCircle2 },
  { key: 'preparing',  label: 'En préparation',   icon: Clock },
  { key: 'delivering', label: 'En livraison',     icon: Truck },
  { key: 'delivered',  label: 'Livrée',           icon: CheckCircle2 },
]

const PICKUP_STEPS: Array<{ key: OrderStatus; label: string; icon: typeof CheckCircle2 }> = [
  { key: 'pending',   label: 'Commande reçue',  icon: CheckCircle2 },
  { key: 'confirmed', label: 'Confirmée',        icon: CheckCircle2 },
  { key: 'preparing', label: 'En préparation',   icon: Clock },
  { key: 'ready',     label: 'Prête au retrait', icon: ShoppingBag },
  { key: 'picked_up', label: 'Récupérée',        icon: CheckCircle2 },
]

const ORDER_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, preparing: 2,
  delivering: 3, ready: 3,
  delivered: 4, picked_up: 4,
}

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente de confirmation',
  confirmed:  'Commande confirmée',
  preparing:  'En cours de préparation',
  ready:      'Prête — venez récupérer votre commande',
  picked_up:  'Récupérée avec succès',
  delivering: 'En route vers vous',
  delivered:  'Livrée avec succès',
  cancelled:  'Commande annulée',
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'text-yellow-600 bg-yellow-50',
  confirmed:  'text-blue-600 bg-blue-50',
  preparing:  'text-purple-600 bg-purple-50',
  ready:      'text-indigo-600 bg-indigo-50',
  delivering: 'text-orange-600 bg-orange-50',
  delivered:  'text-primary bg-primary-50',
  cancelled:  'text-red-600 bg-red-50',
  picked_up:  'text-primary bg-primary-50',
}

interface Props {
  orderId: string
  initialStatus: OrderStatus
  deliveryType: 'delivery' | 'pickup'
}

export default function OrderStatusTracker({ orderId, initialStatus, deliveryType }: Props) {
  const { status } = useRealtimeOrder(orderId, initialStatus)

  const isCancelled = status === 'cancelled'
  const steps = deliveryType === 'delivery' ? DELIVERY_STEPS : PICKUP_STEPS
  const currentStep = ORDER_INDEX[status] ?? 0
  const statusColor = STATUS_COLORS[status] ?? 'text-gray-600 bg-gray-50'

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-center text-sm text-red-600 font-medium">
        Cette commande a été annulée.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
      {/* Statut courant en bannière */}
      <div className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 mb-4 text-sm font-medium ${statusColor}`}>
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        {STATUS_LABELS[status] ?? status}
      </div>

      {/* Étapes */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
        <div className="space-y-4">
          {steps.map((step, i) => {
            const done = i <= currentStep
            const active = i === currentStep
            const Icon = step.icon
            return (
              <div key={step.key} className="flex items-center gap-3 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-colors ${
                  done ? 'bg-primary-500' : 'bg-gray-100'
                } ${active ? 'ring-2 ring-green-300 ring-offset-1' : ''}`}>
                  <Icon size={14} className={done ? 'text-white' : 'text-gray-400'} />
                </div>
                <span className={`text-sm transition-colors ${done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {active && (
                  <span className="ml-auto text-xs text-primary font-medium animate-pulse">En cours</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
