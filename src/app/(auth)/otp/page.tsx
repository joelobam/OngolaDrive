'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function OtpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) {
      setError('Impossible d\'envoyer le code. Vérifiez le numéro.')
      setLoading(false)
      return
    }
    setStep('verify')
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error) {
      setError('Code incorrect ou expiré.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Connexion par SMS</h2>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+237 6XX XX XX XX"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={sendOtp}
            disabled={loading || !phone}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Envoi...' : 'Recevoir le code'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Code envoyé au <strong>{phone}</strong></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code SMS</label>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={verifyOtp}
            disabled={loading || token.length < 6}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Vérification...' : 'Valider'}
          </button>
          <button onClick={() => setStep('phone')} className="w-full text-sm text-gray-500 hover:underline">
            Changer de numéro
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/login" className="text-green-600 hover:underline">Retour à la connexion</Link>
      </p>
    </div>
  )
}
