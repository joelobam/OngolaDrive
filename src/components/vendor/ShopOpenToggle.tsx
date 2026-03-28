'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ShopOpenToggle({ shopId, isOpen }: { shopId: string; isOpen: boolean }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(isOpen)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (createClient().from('shops') as any).update({ is_open: !open }).eq('id', shopId)
    setOpen(!open)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        open ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${open ? 'bg-white' : 'bg-gray-400'}`} />
      {open ? 'Boutique ouverte' : 'Boutique fermée'}
    </button>
  )
}
