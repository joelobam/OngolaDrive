'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { MapPin, ShoppingBag, Smartphone, CreditCard, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type DeliveryMode = 'delivery' | 'pickup'
type PaymentMethod = 'mtn_momo' | 'orange_money' | 'card' | 'cash'

const DELIVERY_FEE = 500

export default function CheckoutPage() {
  const router = useRouter()
  const { items, marketId, total, clearCart } = useCartStore()

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fee = deliveryMode === 'delivery' ? DELIVERY_FEE : 0
  const grandTotal = total() + fee

  const handleOrder = async () => {
    if (!marketId) return
    if (deliveryMode === 'delivery' && !address.trim()) {
      setError('Veuillez saisir une adresse de livraison.')
      return
    }
    if (deliveryMode === 'delivery' && paymentMethod === 'cash') {
      setError('Le paiement cash est uniquement disponible pour le retrait sur place.')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ordersTable = supabase.from('orders') as any
    const { data: order, error: orderError } = await ordersTable.insert({
      market_id: marketId,
      customer_id: user.id,
      delivery_type: deliveryMode,
      delivery_address_id: null,
      status: 'pending',
      subtotal: total(),
      delivery_fee: fee,
      commission_amount: 0,
      total: grandTotal,
      notes: notes || null,
    }).select('id').single()

    if (orderError || !order) {
      setError('Erreur lors de la création de la commande. Réessayez.')
      setLoading(false)
      return
    }

    // Insérer les lignes de commande
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemsTable = supabase.from('order_items') as any
    const orderItems = items.map(item => ({
      order_id: order.id,
      shop_id: item.shopId,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      status: 'pending',
    }))

    const { error: itemsError } = await itemsTable.insert(orderItems)
    if (itemsError) {
      setError('Erreur lors de l\'enregistrement des articles.')
      setLoading(false)
      return
    }

    // Créer le paiement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = supabase.from('payments') as any
    await paymentsTable.insert({
      order_id: order.id,
      method: paymentMethod,
      status: paymentMethod === 'cash' ? 'pending' : 'pending',
      amount: grandTotal,
      currency: 'XAF',
    })

    // Paiement cash → confirmer directement et rediriger
    if (paymentMethod === 'cash') {
      clearCart()
      router.push(`/orders/${order.id}`)
      return
    }

    // Paiement électronique → initier CinetPay
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'initiation du paiement.')
        setLoading(false)
        return
      }

      clearCart()
      // Rediriger vers la page de paiement CinetPay
      window.location.href = data.paymentUrl
    } catch {
      setError('Impossible de contacter le service de paiement. Réessayez.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cart" className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Finaliser la commande</h1>
      </div>

      {/* Mode de livraison */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Mode de réception</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'delivery', label: 'Livraison', sub: `+${formatPrice(DELIVERY_FEE)}`, icon: MapPin },
            { value: 'pickup',   label: 'Retrait',   sub: 'Gratuit',                       icon: ShoppingBag },
          ] as const).map(({ value, label, sub, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setDeliveryMode(value)
                if (value === 'pickup') setPaymentMethod('cash')
                else if (paymentMethod === 'cash') setPaymentMethod('mtn_momo')
              }}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-colors ${
                deliveryMode === value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <Icon size={22} className={deliveryMode === value ? 'text-green-600' : 'text-gray-400'} />
              <span className={`text-sm font-semibold ${deliveryMode === value ? 'text-green-700' : 'text-gray-700'}`}>{label}</span>
              <span className="text-xs text-gray-400">{sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Adresse livraison */}
      {deliveryMode === 'delivery' && (
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Adresse de livraison</h2>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            placeholder="Quartier, rue, point de repère..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </section>
      )}

      {/* Méthode de paiement */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Paiement</h2>
        <div className="space-y-2">
          {([
            { value: 'mtn_momo',    label: 'MTN Mobile Money',    icon: Smartphone, disabled: false },
            { value: 'orange_money', label: 'Orange Money',        icon: Smartphone, disabled: false },
            { value: 'card',        label: 'Carte bancaire',       icon: CreditCard, disabled: false },
            { value: 'cash',        label: 'Cash (retrait uniquement)', icon: ShoppingBag, disabled: deliveryMode === 'delivery' },
          ] as const).map(({ value, label, icon: Icon, disabled }) => (
            <button
              key={value}
              onClick={() => !disabled && setPaymentMethod(value)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors text-left ${
                paymentMethod === value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Icon size={18} className={paymentMethod === value ? 'text-green-600' : 'text-gray-400'} />
              <span className={`text-sm font-medium ${paymentMethod === value ? 'text-green-700' : 'text-gray-700'}`}>{label}</span>
              {paymentMethod === value && (
                <span className="ml-auto w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Note */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Note (optionnel)</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Instructions spéciales, allergies..."
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </section>

      {/* Récapitulatif */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1.5">
          <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
          <span>{formatPrice(total())}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>Frais de livraison</span>
          <span>{deliveryMode === 'delivery' ? formatPrice(fee) : 'Gratuit'}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span className="text-green-600 text-lg">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl mb-4">{error}</p>}

      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {loading
          ? 'Traitement...'
          : paymentMethod === 'cash'
            ? `Commander · ${formatPrice(grandTotal)}`
            : `Payer · ${formatPrice(grandTotal)}`
        }
      </button>
    </div>
  )
}
