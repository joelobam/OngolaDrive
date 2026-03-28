import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProductForm from '@/components/vendor/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id, market_id').eq('owner_id', user.id).single() as { data: { id: string; market_id: string } | null; error: unknown }

  if (!shop) redirect('/vendor/shop')

  const [productRes, categoriesRes] = await Promise.all([
    supabase.from('products')
      .select('id, name, slug, description, category_id, price, compare_price, unit, stock, is_featured')
      .eq('id', id).eq('shop_id', shop.id).single(),
    supabase.from('categories')
      .select('id, name').eq('market_id', shop.market_id).eq('is_active', true).order('name'),
  ])

  const product = productRes.data as {
    id: string; name: string; slug: string; description: string | null
    category_id: string | null; price: number; compare_price: number | null
    unit: string; stock: number | null; is_featured: boolean
  } | null

  if (!product) notFound()

  const categories = categoriesRes.data as Array<{ id: string; name: string }> | null

  return (
    <div>
      <Link href="/vendor/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Retour aux produits
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Modifier — {product.name}</h1>
      <ProductForm product={product} shopId={shop.id} categories={categories ?? []} />
    </div>
  )
}
