export type UserRole = 'super_admin' | 'market_admin' | 'vendor' | 'customer' | 'delivery_agent'
export type MarketStatus = 'pending' | 'active' | 'suspended'
export type ShopStatus = 'pending' | 'active' | 'suspended' | 'closed'
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled' | 'refunded'
export type DeliveryType = 'delivery' | 'pickup'
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'card' | 'cash'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type CommissionStatus = 'pending' | 'collected' | 'disputed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
        }
        Update: {
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
        }
      }
      markets: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          city: string
          country: string
          address: string | null
          location: string | null
          cover_image: string | null
          logo_url: string | null
          contact_phone: string | null
          contact_email: string | null
          status: MarketStatus
          commission_rate: number
          currency: string
          admin_id: string | null
          settings: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          city: string
          country?: string
          address?: string | null
          location?: string | null
          cover_image?: string | null
          logo_url?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          status?: MarketStatus
          commission_rate?: number
          currency?: string
          admin_id?: string | null
          settings?: Record<string, unknown>
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          city?: string
          address?: string | null
          cover_image?: string | null
          logo_url?: string | null
          status?: MarketStatus
          admin_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          market_id: string | null
          parent_id: string | null
          name: string
          slug: string
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          market_id?: string | null
          parent_id?: string | null
          name: string
          slug: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          slug?: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
        }
      }
      shops: {
        Row: {
          id: string
          market_id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          phone: string | null
          logo_url: string | null
          cover_image: string | null
          booth_number: string | null
          location: string | null
          category_ids: string[]
          status: ShopStatus
          is_open: boolean
          rating: number
          review_count: number
          settings: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          market_id: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          phone?: string | null
          logo_url?: string | null
          cover_image?: string | null
          booth_number?: string | null
          location?: string | null
          category_ids?: string[]
          status?: ShopStatus
          is_open?: boolean
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          phone?: string | null
          logo_url?: string | null
          cover_image?: string | null
          booth_number?: string | null
          location?: string | null
          status?: ShopStatus
          is_open?: boolean
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          images: string[]
          price: number
          compare_price: number | null
          unit: string
          min_quantity: number
          stock: number | null
          sku: string | null
          status: ProductStatus
          is_available: boolean
          is_featured: boolean
          tags: string[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          images?: string[]
          price: number
          compare_price?: number | null
          unit?: string
          min_quantity?: number
          stock?: number | null
          sku?: string | null
          status?: ProductStatus
          is_available?: boolean
          is_featured?: boolean
          tags?: string[]
          metadata?: Record<string, unknown>
        }
        Update: {
          name?: string
          description?: string | null
          images?: string[]
          price?: number
          compare_price?: number | null
          stock?: number | null
          status?: ProductStatus
          is_featured?: boolean
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          recipient_name: string
          phone: string
          address_line: string
          neighborhood: string | null
          city: string
          location: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          recipient_name: string
          phone: string
          address_line: string
          neighborhood?: string | null
          city: string
          location?: string | null
          is_default?: boolean
        }
        Update: {
          label?: string
          recipient_name?: string
          phone?: string
          address_line?: string
          neighborhood?: string | null
          is_default?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          market_id: string
          customer_id: string
          delivery_type: DeliveryType
          delivery_address_id: string | null
          delivery_agent_id: string | null
          status: OrderStatus
          subtotal: number
          delivery_fee: number
          commission_amount: number
          total: number
          notes: string | null
          estimated_delivery_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          cancel_reason: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          market_id: string
          customer_id: string
          delivery_type: DeliveryType
          delivery_address_id?: string | null
          delivery_agent_id?: string | null
          status?: OrderStatus
          subtotal: number
          delivery_fee?: number
          commission_amount?: number
          total: number
          notes?: string | null
          metadata?: Record<string, unknown>
        }
        Update: {
          delivery_agent_id?: string | null
          status?: OrderStatus
          delivery_fee?: number
          estimated_delivery_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          cancel_reason?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          shop_id: string
          product_id: string
          product_name: string
          product_image: string | null
          unit_price: number
          quantity: number
          subtotal: number
          status: OrderStatus
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          shop_id: string
          product_id: string
          product_name: string
          product_image?: string | null
          unit_price: number
          quantity: number
          subtotal: number
          status?: OrderStatus
          notes?: string | null
        }
        Update: {
          status?: OrderStatus
          notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          method: PaymentMethod
          status: PaymentStatus
          amount: number
          currency: string
          transaction_id: string | null
          provider: string | null
          provider_ref: string | null
          paid_at: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          method: PaymentMethod
          status?: PaymentStatus
          amount: number
          currency?: string
          transaction_id?: string | null
          provider?: string | null
          provider_ref?: string | null
          metadata?: Record<string, unknown>
        }
        Update: {
          status?: PaymentStatus
          transaction_id?: string | null
          provider_ref?: string | null
          paid_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          customer_id: string
          shop_id: string
          product_id: string | null
          rating: number
          comment: string | null
          images: string[]
          is_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_id: string
          shop_id: string
          product_id?: string | null
          rating: number
          comment?: string | null
          images?: string[]
        }
        Update: {
          is_visible?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: string
          data: Record<string, unknown>
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          type: string
          data?: Record<string, unknown>
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
      }
      commissions: {
        Row: {
          id: string
          market_id: string
          order_id: string
          shop_id: string
          rate: number
          base_amount: number
          commission_amount: number
          status: CommissionStatus
          collected_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          market_id: string
          order_id: string
          shop_id: string
          rate: number
          base_amount: number
          commission_amount: number
          status?: CommissionStatus
        }
        Update: {
          status?: CommissionStatus
          collected_at?: string | null
        }
      }
    }
  }
}
