'use client'

import { useState } from 'react'
import { createCategory } from '@/app/actions/categoryActions'

interface Props {
  markets: { id: string; name: string }[]
}

export default function CategoryForm({ markets }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', market_id: '', icon: '', sort_order: '0',
  })

  const set = (k: string, v: string) => { setSuccess(false); setForm(f => ({ ...f, [k]: v })) }

  const generateSlug = () => {
    const slug = form.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    set('slug', slug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createCategory({
        name: form.name,
        slug: form.slug,
        market_id: form.market_id || null,
        icon: form.icon,
        sort_order: parseInt(form.sort_order) || 0,
      })
      setSuccess(true)
      setForm({ name: '', slug: '', market_id: '', icon: '', sort_order: '0' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nom <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Fruits & Légumes" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="button" onClick={generateSlug}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">
            → Slug
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Slug <span className="text-red-500">*</span></label>
        <input required value={form.slug} onChange={e => set('slug', e.target.value)}
          placeholder="fruits-legumes" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Marché (optionnel)</label>
          <select value={form.market_id} onChange={e => set('market_id', e.target.value)} className={inputCls}>
            <option value="">— Global —</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
          <input type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)}
            className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Icône (emoji ou nom)</label>
        <input value={form.icon} onChange={e => set('icon', e.target.value)}
          placeholder="🥦 ou fruit" className={inputCls} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-primary bg-primary-light px-3 py-2 rounded-lg">Catégorie créée !</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
        {loading ? 'Enregistrement...' : 'Créer la catégorie'}
      </button>
    </form>
  )
}
