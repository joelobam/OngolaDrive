import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, MapPin, Package } from 'lucide-react'

type Delivery = {
  id: string
  status: string
  created_at: string
  order: {
    id: string
    order_number: string
    status: string
    total: number
    delivery_type: string
    notes: string | null
    market: { name: string; city: string; address: string | null } | null
    customer: { full_name: string; phone: string | null } | null
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  assigned:  { label: 'À récupérer',   className: 'bg-yellow-100 text-yellow-700' },
  picked_up: { label: 'En livraison',  className: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Livrée',        className: 'bg-primary-light text-primary-dark' },
}

const TABS = [
  { key: 'active',    label: 'En cours',   statuses: ['assigned', 'picked_up'] },
  { key: 'delivered', label: 'Terminées',  statuses: ['delivered'] },
]

export default async function DriverDeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'active' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tab = TABS.find(t => t.key === status) ?? TABS[0]

  const { data: deliveries } = await supabase
    .from('deliveries')
    .select('id, status, created_at, order:order_id(id, order_number, status, total, delivery_type, notes, market:market_id(name, city, address), customer:customer_id(full_name, phone))')
    .eq('driver_id', user.id)
    .in('status', tab.statuses)
    .order('created_at', { ascending: false }) as { data: Delivery[] | null; error: unknown }

  return (
    <div className="px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Mes livraisons</h1>
        <p className="text-sm text-gray-400 mt-0.5">{deliveries?.length ?? 0} livraison(s)</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <a key={tab.key} href={`/driver/deliveries?status=${tab.key}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              status === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >{tab.label}</a>
        ))}
      </div>

      {!deliveries?.length ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <Package size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Aucune livraison {status === 'active' ? 'en cours' : 'terminée'}</p>
          <p className="text-sm text-gray-400 mt-1">Les livraisons assignées apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map(delivery => {
            const cfg = STATUS_CONFIG[delivery.status] ?? { label: delivery.status, className: 'bg-gray-100 text-gray-500' }
            const order = delivery.order
            return (
              <Link key={delivery.id} href={`/driver/deliveries/${delivery.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{order?.order_number ?? '—'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{order?.customer?.full_name}</p>
                    {order?.customer?.phone && (
                      <a href={`tel:${order.customer.phone}`} className="text-xs text-primary font-medium" onClick={e => e.stopPropagation()}>
                        {order.customer.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <span className="font-bold text-primary text-sm">{formatPrice(order?.total ?? 0)}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-gray-400">
                  <MapPin size={12} className="mt-0.5 flex-shrink-0 text-primary" />
                  <span>{order?.market?.name} · {order?.market?.address ?? order?.market?.city}</span>
                </div>

                {order?.notes && (
                  <p className="text-xs text-gray-400 italic mt-1.5 border-t border-gray-50 pt-1.5">
                    {order.notes}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
