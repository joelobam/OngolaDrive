'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'

export default function ShopValidationActions({ shopId }: { shopId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  const handle = async (action: 'approve' | 'reject') => {
    setLoading(action)
    const supabase = createClient()
    const status = action === 'approve' ? 'active' : 'suspended'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('shops') as any).update({ status }).eq('id', shopId)
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handle('approve')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-dark text-xs font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors"
      >
        <Check size={13} />
        Valider
      </button>
      <button
        onClick={() => handle('reject')}
        disabled={loading !== null}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        <X size={13} />
        Rejeter
      </button>
    </div>
  )
}
