'use client'

import { useState } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Product {
  id: string; name: string; price: number; compare_price: number | null
  images: string[]; unit: string; stock: number | null
  description: string | null; category: { name: string } | null
}

interface Props {
  product: Product
  shopId: string
  marketId: string
  marketSlug: string
}

export default function ProductCard({ product, shopId, marketId, marketSlug }: Props) {
  const router = useRouter()
  const { items, addItem, updateQuantity, marketId: cartMarketId } = useCartStore()
  const cartItem = items.find(i => i.productId === product.id)
  const qty = cartItem?.quantity ?? 0
  const [conflictWarning, setConflictWarning] = useState(false)

  const handleAdd = () => {
    if (cartMarketId && cartMarketId !== marketId) {
      setConflictWarning(true)
      return
    }
    addItem(marketId, {
      productId: product.id,
      shopId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] ?? null,
    })
  }

  const handleConfirmSwitch = () => {
    addItem(marketId, {
      productId: product.id,
      shopId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] ?? null,
    })
    setConflictWarning(false)
  }

  const isOutOfStock = product.stock !== null && product.stock === 0

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${isOutOfStock ? 'opacity-60' : ''}`}>
        <div className="h-28 bg-gray-50 relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🛒</div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Rupture</span>
            </div>
          )}
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              -{Math.round((1 - product.price / product.compare_price) * 100)}%
            </span>
          )}
        </div>

        <div className="p-2.5">
          <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{product.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">/{product.unit}</p>

          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
              {product.compare_price && (
                <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
              )}
            </div>

            {!isOutOfStock && (
              qty === 0 ? (
                <button
                  onClick={handleAdd}
                  className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(product.id, qty - 1)}
                    className="w-7 h-7 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-semibold text-gray-800 w-5 text-center">{qty}</span>
                  <button
                    onClick={() => updateQuantity(product.id, qty + 1)}
                    className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal conflit de marché */}
      {conflictWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
              <ShoppingCart size={22} className="text-orange-600" />
            </div>
            <h3 className="text-center font-semibold text-gray-800 mb-2">Changer de marché ?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Votre panier contient des articles d&apos;un autre marché. En continuant, votre panier sera vidé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConflictWarning(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors"
              >
                Vider et continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
