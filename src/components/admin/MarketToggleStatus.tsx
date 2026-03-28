'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Power } from 'lucide-react'

interface Props {
  marketId: string
  currentStatus: string
}

export default function MarketToggleStatus({ marketId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('markets') as any).update({ status: newStatus }).eq('id', marketId)
    router.refresh()
    setLoading(false)
  }

  const isActive = currentStatus === 'active'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isActive ? 'Suspendre' : 'Activer'}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
        isActive
          ? 'text-primary hover:bg-primary-50'
          : 'text-gray-400 hover:bg-gray-100'
      }`}
    >
      <Power size={15} />
    </button>
  )
}
