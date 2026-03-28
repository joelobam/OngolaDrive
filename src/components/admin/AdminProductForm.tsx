'use client'

import { useState } from 'react'
import { createProductAsAdmin } from '@/app/actions/shopActions'

const UNITS = ['pièce', 'kg', 'g', 'litre', 'cl', 'sachet', 'boîte', 'lot', 'paquet']

interface Props {
  shopId: string
  categories: { id: string; name: string }[]
}

export default function AdminProductForm({ shopId, categories }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', category_id: '',
    price: '', compare_price: '', unit: 'pièce', stock: '',
    is_featured: false,
  })

  const set = (k: string, v: string | boolean) => {
    setSuccess(false)
    setForm(f => ({ ...f, [k]: v }))
  }

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
    setSuccess(false)

    try {
      await createProductAsAdmin({
        name: form.name,
        slug: form.slug,
        description: form.description,
        shop_id: shopId,
        category_id: form.category_id,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        unit: form.unit,
        stock: form.stock ? parseInt(form.stock) : null,
        is_featured: form.is_featured,
      })
      setSuccess(true)
      setForm({ name: '', slug: '', description: '', category_id: '', price: '', compare_price: '', unit: 'pièce', stock: '', is_featured: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nom + Slug */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nom <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Tomates fraîches" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="button" onClick={generateSlug}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">
            → Slug
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Slug <span className="text-red-500">*</span></label>
        <input required value={form.slug} onChange={e => set('slug', e.target.value)}
          placeholder="tomates-fraiches" className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          rows={2} placeholder="Fraîches du marché, livrées le matin..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputCls}>
            <option value="">— Sans catégorie —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Unité <span className="text-red-500">*</span></label>
          <select required value={form.unit} onChange={e => set('unit', e.target.value)} className={inputCls}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Prix (FCFA) <span className="text-red-500">*</span></label>
          <input required type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)}
            placeholder="500" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Prix barré</label>
          <input type="number" min="0" value={form.compare_price} onChange={e => set('compare_price', e.target.value)}
            placeholder="700" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
          <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
            placeholder="∞" className={inputCls} />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)}
          className="w-4 h-4 accent-[#E8231A]" />
        <span className="text-xs text-gray-600">Mettre en vedette</span>
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-primary bg-primary-light px-3 py-2 rounded-lg">Produit ajouté avec succès !</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
        {loading ? 'Enregistrement...' : 'Ajouter le produit'}
      </button>
    </form>
  )
}
