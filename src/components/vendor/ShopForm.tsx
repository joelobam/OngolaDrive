'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  market_id: z.string().min(1, 'Sélectionnez un marché'),
  name: z.string().min(2, 'Nom requis'),
  slug: z.string().min(2, 'Slug requis').regex(/^[a-z0-9-]+$/, 'Minuscules, chiffres et tirets uniquement'),
  description: z.string().optional(),
  phone: z.string().optional(),
  booth_number: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  shop?: { id: string; name: string; slug: string; description: string | null; phone: string | null; booth_number: string | null; market: { name: string; city: string } | null } | null
  markets: Array<{ id: string; name: string; city: string }>
  ownerId: string
}

export default function ShopForm({ shop, markets, ownerId }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: shop
      ? { name: shop.name, slug: shop.slug, description: shop.description ?? '', phone: shop.phone ?? '', booth_number: shop.booth_number ?? '', market_id: '' }
      : {},
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
    const table = createClient().from('shops') as any

    if (shop?.id) {
      const { error } = await table.update({
        name: data.name, slug: data.slug,
        description: data.description, phone: data.phone,
        booth_number: data.booth_number,
      }).eq('id', shop.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await table.insert({
        ...data, owner_id: ownerId, status: 'pending', is_open: false,
      })
      if (error) { setError(error.message); setLoading(false); return }
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      {!shop && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marché <span className="text-red-500">*</span></label>
          <select
            {...register('market_id')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Sélectionnez un marché —</option>
            {markets.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.city})</option>
            ))}
          </select>
          {errors.market_id && <p className="text-red-500 text-xs mt-1">{errors.market_id.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input {...register('name')} placeholder="Ma boutique" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="button" onClick={generateSlug} className="px-3 py-2.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">→ Slug</button>
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
          <input {...register('slug')} placeholder="ma-boutique" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea {...register('description')} rows={3} placeholder="Décrivez votre boutique..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input {...register('phone')} placeholder="+237 6XX XX XX XX" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">N° kiosque / stand</label>
          <input {...register('booth_number')} placeholder="A-12" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? 'Enregistrement...' : shop ? 'Mettre à jour' : 'Créer ma boutique'}
      </button>
    </form>
  )
}
