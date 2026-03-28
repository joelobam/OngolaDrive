'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, ShoppingBag, Users, Truck,
  BarChart2, Settings, LogOut, ChevronRight, Tag
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/markets', label: 'Marchés', icon: Store },
  { href: '/admin/shops', label: 'Boutiques', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Catégories', icon: Tag },
  { href: '/admin/drivers', label: 'Livreurs', icon: Truck },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/stats', label: 'Statistiques', icon: BarChart2 },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
]

interface Props {
  role: string
  fullName: string
  avatarUrl: string | null
}

export default function AdminSidebar({ role, fullName, avatarUrl }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Image src="/logo.png" alt="OngolaDrive" width={150} height={52} className="object-contain" />
        <p className="text-xs text-gray-400 mt-1">Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-dark'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-primary/70" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-sm font-semibold">
              {getInitials(fullName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{fullName}</p>
            <p className="text-xs text-gray-400 capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
