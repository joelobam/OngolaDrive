const CONFIG = {
  active:    { label: 'Actif',     className: 'bg-primary-light text-primary-dark' },
  pending:   { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: 'Suspendu',  className: 'bg-red-100 text-red-700' },
} as const

export default function MarketStatusBadge({ status }: { status: string }) {
  const config = CONFIG[status as keyof typeof CONFIG] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
