'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/orders',    label: 'Commandes', icon: Package },
  { href: '/profile',   label: 'Profil',  icon: User },
]

export default function ClientNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} className={cn('flex flex-col items-center gap-0.5 text-xs', active ? 'text-primary' : 'text-gray-400')}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
