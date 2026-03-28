'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, ShoppingCart, LogOut, ChevronRight } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/vendor/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/vendor/shop',      label: 'Ma boutique', icon: ShoppingBag },
  { href: '/vendor/products',  label: 'Produits',    icon: Package },
  { href: '/vendor/orders',    label: 'Commandes',   icon: ShoppingCart },
]

interface Props {
  fullName: string
  avatarUrl: string | null
  shopName: string | null
  shopStatus: string | null
  isOpen: boolean
}

export default function VendorSidebar({ fullName, avatarUrl, shopName, shopStatus, isOpen }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-green-600">OngolaDrive</h1>
        <p className="text-xs text-gray-400 mt-0.5">Espace vendeur</p>
      </div>

      {shopName && (
        <div className="px-4 py-3 mx-3 mt-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-400 mb-0.5">Boutique</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{shopName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-500">
              {shopStatus === 'pending' ? 'En attente de validation' : isOpen ? 'Ouverte' : 'Fermée'}
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-green-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
              {getInitials(fullName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{fullName}</p>
            <p className="text-xs text-gray-400">Vendeur</p>
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
