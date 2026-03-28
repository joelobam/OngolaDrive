'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import NotificationBell from './NotificationBell'

interface Props {
  userId: string | null
}

export default function ClientHeader({ userId }: Props) {
  const itemCount = useCartStore(s => s.itemCount())

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link href="/dashboard">
        <Image src="/logo.png" alt="OngolaDrive" width={130} height={44} className="object-contain" priority />
      </Link>
      <div className="flex items-center gap-1">
        {userId && <NotificationBell userId={userId} />}
        <Link href="/cart" className="relative p-2">
          <ShoppingCart size={22} className="text-gray-700" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
