'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ToggleLeft, ToggleRight } from 'lucide-react'

export default function DriverToggleActive({ driverId, isActive }: { driverId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any).update({ is_active: !isActive }).eq('id', driverId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isActive ? 'Désactiver' : 'Activer'}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
        isActive
          ? 'text-red-600 bg-red-50 hover:bg-red-100'
          : 'text-primary bg-primary-50 hover:bg-primary-light'
      }`}
    >
      {isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
      {isActive ? 'Désactiver' : 'Activer'}
    </button>
  )
}
