'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Truck, CheckCircle, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/driver/deliveries',           label: 'Livraisons', icon: Truck },
  { href: '/driver/deliveries?status=delivered', label: 'Historique', icon: CheckCircle },
  { href: '/driver/profile',              label: 'Profil',     icon: User },
]

export default function DriverNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-10">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href.split('?')[0]
        return (
          <Link key={href} href={href}
            className={cn('flex flex-col items-center gap-0.5 text-xs', active ? 'text-green-600' : 'text-gray-400')}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
      <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 text-xs text-gray-400 hover:text-red-400">
        <LogOut size={20} />
        <span>Quitter</span>
      </button>
    </nav>
  )
}
