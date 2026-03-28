import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  shopId: string
  name: string
  price: number
  quantity: number
  image: string | null
}

interface CartState {
  marketId: string | null
  items: CartItem[]
  addItem: (marketId: string, item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      marketId: null,
      items: [],

      addItem: (marketId, item) => {
        const { marketId: currentMarket, items } = get()

        // Si nouveau marché, vider le panier existant
        if (currentMarket && currentMarket !== marketId) {
          set({ marketId, items: [{ ...item, quantity: 1 }] })
          return
        }

        const existing = items.find(i => i.productId === item.productId)
        if (existing) {
          set({
            items: items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ marketId, items: [...items, { ...item, quantity: 1 }] })
        }
      },

      removeItem: (productId) =>
        set(state => ({ items: state.items.filter(i => i.productId !== productId) })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ marketId: null, items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'ongola-cart' }
  )
)
