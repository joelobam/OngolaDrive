'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  slug: z.string().min(2, 'Slug requis').regex(/^[a-z0-9-]+$/, 'Minuscules, chiffres et tirets uniquement'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().min(0, 'Prix invalide'),
  compare_price: z.number().optional(),
  unit: z.string().min(1),
  stock: z.number().optional(),
  is_featured: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

interface ProductData {
  id: string; name: string; slug: string; description: string | null
  category_id: string | null; price: number; compare_price: number | null
  unit: string; stock: number | null; is_featured: boolean
}

interface Props {
  product?: ProductData | null
  shopId: string
  categories: Array<{ id: string; name: string }>
}

export default function ProductForm({ product, shopId, categories }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: product
      ? {
          name: product.name, slug: product.slug,
          description: product.description ?? '',
          category_id: product.category_id ?? '',
          price: product.price,
          compare_price: product.compare_price ?? undefined,
          unit: product.unit, stock: product.stock ?? undefined,
          is_featured: product.is_featured,
        }
      : { unit: 'pièce', is_featured: false },
  })

  const nameValue = watch('name')

  const generateSlug = () => {
    const slug = (nameValue ?? '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setValue('slug', slug)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = createClient().from('products') as any

    const payload = {
      ...data,
      category_id: data.category_id || null,
      compare_price: data.compare_price || null,
      stock: data.stock ?? null,
    }

    if (product?.id) {
      const { error } = await table.update(payload).eq('id', product.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await table.insert({ ...payload, shop_id: shopId, status: 'active' })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/vendor/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Nom + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input {...register('name')} placeholder="Tomates fraîches" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button type="button" onClick={generateSlug} className="px-3 py-2.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">→ Slug</button>
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
          <input {...register('slug')} placeholder="tomates-fraiches" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea {...register('description')} rows={3} placeholder="Décrivez votre produit..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      {/* Catégorie + Unité */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select {...register('category_id')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">— Sans catégorie —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unité <span className="text-red-500">*</span></label>
          <select {...register('unit')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {['pièce', 'kg', 'g', 'litre', 'cl', 'sachet', 'boîte', 'lot', 'paquet'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prix */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (XAF) <span className="text-red-500">*</span></label>
          <input {...register('price', { valueAsNumber: true })} type="number" min={0} placeholder="500" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix barré (XAF)</label>
          <input {...register('compare_price', { valueAsNumber: true })} type="number" min={0} placeholder="700" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input {...register('stock', { valueAsNumber: true })} type="number" min={0} placeholder="∞ illimité" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {/* En vedette */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input {...register('is_featured')} type="checkbox" className="w-4 h-4 accent-green-600" />
        <span className="text-sm text-gray-700">Mettre en vedette (affiché en haut du catalogue)</span>
      </label>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
          {loading ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Ajouter le produit'}
        </button>
        <button type="button" onClick={() => router.push('/vendor/products')} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          Annuler
        </button>
      </div>
    </form>
  )
}
