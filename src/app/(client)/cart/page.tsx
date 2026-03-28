'use client'

import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount, marketId } = useCartStore()

  // Grouper par boutique
  const byShop: Record<string, typeof items> = {}
  for (const item of items) {
    byShop[item.shopId] = byShop[item.shopId] ?? []
    byShop[item.shopId].push(item)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <ShoppingCart size={48} className="text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Votre panier est vide</h2>
        <p className="text-sm text-gray-400 mb-6 text-center">Ajoutez des produits depuis un marché pour commander.</p>
        <Link href="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
          Explorer les marchés
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Panier ({itemCount()})</h1>
        <button onClick={() => clearCart()} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
          <Trash2 size={13} /> Vider
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {Object.entries(byShop).map(([shopId, shopItems]) => (
          <div key={shopId} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Boutique</p>
            </div>
            <div className="divide-y divide-gray-50">
              {shopItems.map(item => (
                <div key={item.productId} className="flex gap-3 p-3">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm text-primary-dark font-semibold mt-0.5">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Récapitulatif */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Sous-total</span>
          <span>{formatPrice(total())}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>Frais de livraison</span>
          <span className="text-gray-400">Calculés à l&apos;étape suivante</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-bold text-lg text-primary">{formatPrice(total())}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-dark transition-colors"
      >
        Passer la commande <ArrowRight size={18} />
      </Link>
    </div>
  )
}
