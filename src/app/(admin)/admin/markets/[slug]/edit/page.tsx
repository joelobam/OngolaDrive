import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MarketForm from '@/components/admin/MarketForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditMarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: market } = await supabase
    .from('markets')
    .select('id, name, slug, description, city, country, address, contact_phone, contact_email, commission_rate, currency')
    .eq('slug', slug)
    .single() as {
      data: {
        id: string; name: string; slug: string; description: string | null
        city: string; country: string; address: string | null
        contact_phone: string | null; contact_email: string | null
        commission_rate: number; currency: string
      } | null; error: unknown
    }

  if (!market) notFound()

  return (
    <div>
      <Link href="/admin/markets" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Retour aux marchés
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Modifier — {market.name}</h1>
      <MarketForm market={{
        ...market,
        description: market.description ?? undefined,
        address: market.address ?? undefined,
        contact_phone: market.contact_phone ?? undefined,
        contact_email: market.contact_email ?? undefined,
      }} />
    </div>
  )
}
