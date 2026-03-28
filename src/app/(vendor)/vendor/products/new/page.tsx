import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/vendor/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id, market_id').eq('owner_id', user.id).single() as { data: { id: string; market_id: string } | null; error: unknown }

  if (!shop) redirect('/vendor/shop')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('market_id', shop.market_id)
    .eq('is_active', true)
    .order('name') as { data: Array<{ id: string; name: string }> | null; error: unknown }

  return (
    <div>
      <Link href="/vendor/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Retour aux produits
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ajouter un produit</h1>
      <ProductForm shopId={shop.id} categories={categories ?? []} />
    </div>
  )
}
