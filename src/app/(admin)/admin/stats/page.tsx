import { BarChart2 } from 'lucide-react'

export default function AdminStatsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-500 text-sm mt-1">Tableaux de bord et indicateurs de performance</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <BarChart2 size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">Bientôt disponible</p>
        <p className="text-gray-300 text-sm mt-1">Les statistiques avancées seront ajoutées prochainement.</p>
      </div>
    </div>
  )
}
