'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function ProductAvailabilityToggle({ productId, currentStatus }: { productId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (createClient().from('products') as any).update({ status: newStatus }).eq('id', productId)
    router.refresh()
    setLoading(false)
  }

  const isActive = currentStatus === 'active'
  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isActive ? 'Désactiver' : 'Activer'}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
        isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
      }`}
    >
      {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
    </button>
  )
}
