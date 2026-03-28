'use client'

import { useState } from 'react'
import { X, Store } from 'lucide-react'
import { createShopAsAdmin } from '@/app/actions/shopActions'

interface Market { id: string; name: string; city: string }
interface Vendor { id: string; full_name: string }

interface Props {
  markets: Market[]
  vendors: Vendor[]
}

export default function CreateShopModal({ markets, vendors }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '',
    market_id: markets[0]?.id ?? '',
    owner_id: vendors[0]?.id ?? '',
    booth_number: '', phone: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

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
      await createShopAsAdmin(form)
      setOpen(false)
      setForm({ name: '', slug: '', description: '', market_id: markets[0]?.id ?? '', owner_id: vendors[0]?.id ?? '', booth_number: '', phone: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <Store size={15} />
        Ajouter une boutique
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">Nouvelle boutique</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom de la boutique</label>
                  <div className="flex gap-2">
                    <input
                      required value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="Chez Madeleine"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button type="button" onClick={generateSlug}
                      className="px-3 py-2 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 whitespace-nowrap">
                      → Slug
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug (URL)</label>
                  <input
                    required value={form.slug} onChange={e => set('slug', e.target.value)}
                    placeholder="chez-madeleine"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description} onChange={e => set('description', e.target.value)}
                  rows={2} placeholder="Spécialités, produits proposés..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marché</label>
                  <select
                    required value={form.market_id} onChange={e => set('market_id', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {markets.map(m => (
                      <option key={m.id} value={m.id}>{m.name} — {m.city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vendeur</label>
                  <select
                    required value={form.owner_id} onChange={e => set('owner_id', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {vendors.length === 0 && <option value="">Aucun vendeur disponible</option>}
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° de kiosque</label>
                  <input
                    value={form.booth_number} onChange={e => set('booth_number', e.target.value)}
                    placeholder="A-12"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                  <input
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+237 6XX XX XX XX"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={loading || vendors.length === 0}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Création...' : 'Créer la boutique'}
                </button>
                <button
                  type="button" onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
