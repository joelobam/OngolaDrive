import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration de la plateforme</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <Settings size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 font-medium">Bientôt disponible</p>
        <p className="text-gray-300 text-sm mt-1">Les paramètres de configuration seront ajoutés prochainement.</p>
      </div>
    </div>
  )
}
