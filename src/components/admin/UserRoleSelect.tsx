'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from '@/app/actions/userActions'

const ROLES = [
  { value: 'customer',       label: 'Client' },
  { value: 'vendor',         label: 'Vendeur' },
  { value: 'delivery_agent', label: 'Livreur' },
  { value: 'market_admin',   label: 'Admin marché' },
  { value: 'super_admin',    label: 'Super Admin' },
]

const COLORS: Record<string, string> = {
  super_admin:    'text-purple-700 bg-purple-50 border-purple-200',
  market_admin:   'text-blue-700 bg-blue-50 border-blue-200',
  vendor:         'text-yellow-700 bg-yellow-50 border-yellow-200',
  delivery_agent: 'text-orange-700 bg-orange-50 border-orange-200',
  customer:       'text-gray-600 bg-gray-50 border-gray-200',
}

interface Props {
  userId: string
  currentRole: string
  isSelf: boolean
}

export default function UserRoleSelect({ userId, currentRole, isSelf }: Props) {
  const [role, setRole] = useState(currentRole)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (newRole: string) => {
    if (newRole === role) return
    setError(null)
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole)
        setRole(newRole)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur')
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={role}
        onChange={e => handleChange(e.target.value)}
        disabled={isPending || isSelf}
        title={isSelf ? 'Vous ne pouvez pas modifier votre propre rôle' : undefined}
        className={`text-xs font-medium px-2 py-1 rounded-lg border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${COLORS[role] ?? COLORS.customer}`}
      >
        {ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {isPending && <p className="text-xs text-gray-400">Mise à jour…</p>}
    </div>
  )
}
