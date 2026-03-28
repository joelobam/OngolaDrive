'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { createUser } from '@/app/actions/userActions'

const ROLES = [
  { value: 'customer',       label: 'Client' },
  { value: 'vendor',         label: 'Vendeur' },
  { value: 'delivery_agent', label: 'Livreur' },
  { value: 'market_admin',   label: 'Admin marché' },
  { value: 'super_admin',    label: 'Super Admin' },
]

export default function CreateUserModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '', role: 'customer',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createUser(form)
      setOpen(false)
      setForm({ full_name: '', email: '', password: '', phone: '', role: 'customer' })
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
        <UserPlus size={15} />
        Ajouter un utilisateur
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Nouvel utilisateur</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet</label>
                <input
                  required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="jean@exemple.cm"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
                <input
                  required type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="8 caractères minimum"
                  minLength={8}
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

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rôle</label>
                <select
                  value={form.role} onChange={e => set('role', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Création...' : 'Créer'}
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
