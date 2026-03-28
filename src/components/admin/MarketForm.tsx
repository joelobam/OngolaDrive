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
  city: z.string().min(2, 'Ville requise'),
  country: z.string().min(1),
  address: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Email invalide').optional().or(z.literal('')),
  commission_rate: z.coerce.number().min(0).max(100),
  currency: z.string().min(1),
})

type FormData = z.infer<typeof schema>

interface Props {
  market?: FormData & { id: string }
}

export default function MarketForm({ market }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: market ?? { commission_rate: 5, currency: 'XAF', country: 'CM' },
  })

  const nameValue = watch('name')

  const generateSlug = () => {
    const slug = nameValue
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
    const table = supabase.from('markets') as any
    if (market?.id) {
      const { error } = await table.update(data).eq('id', market.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await table.insert({ ...data, status: 'active' })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/admin/markets')
    router.refresh()
  }

  const Field = ({ label, name, required, ...props }: { label: string; name: keyof FormData; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        {...register(name)}
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du marché <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              {...register('name')}
              placeholder="Marché Mokolo"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-3 py-2.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              → Slug
            </button>
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <Field label="Slug (URL)" name="slug" required placeholder="marche-mokolo" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Décrivez le marché..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Ville" name="city" required placeholder="Yaoundé" />
        <Field label="Adresse" name="address" placeholder="Quartier, rue..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Téléphone contact" name="contact_phone" placeholder="+237 6XX XX XX XX" />
        <Field label="Email contact" name="contact_email" type="email" placeholder="marche@exemple.cm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Taux de commission (%)</label>
          <input
            {...register('commission_rate')}
            type="number"
            min={0}
            max={100}
            step={0.5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.commission_rate && <p className="text-red-500 text-xs mt-1">{errors.commission_rate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
          <select
            {...register('currency')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="XAF">XAF — Franc CFA</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enregistrement...' : market ? 'Mettre à jour' : 'Créer le marché'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/markets')}
          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
