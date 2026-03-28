import MarketForm from '@/components/admin/MarketForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewMarketPage() {
  return (
    <div>
      <Link href="/admin/markets" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Retour aux marchés
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nouveau marché</h1>
      <MarketForm />
    </div>
  )
}
