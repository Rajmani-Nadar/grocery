import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity: number) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === product.id)
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: `${Date.now()}`,
                productId: product.id,
                product,
                quantity,
              },
            ],
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const state = get()
        return state.items.reduce((total, item) => {
          const price = item.product?.discountPrice || item.product?.price || 0
          return total + price * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'grocery-cart',
      version: 1,
    }
  )
)

interface WishlistState {
  items: string[] // productIds
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string) => {
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        }))
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }))
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId)
      },

      clearWishlist: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'grocery-wishlist',
      version: 1,
    }
  )
)

interface FilterState {
  selectedCategories: string[]
  priceRange: [number, number]
  searchQuery: string
  sortBy: string
  setSelectedCategories: (categories: string[]) => void
  setPriceRange: (range: [number, number]) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: string) => void
  resetFilters: () => void
}

export const useFilters = create<FilterState>((set) => ({
  selectedCategories: [],
  priceRange: [0, 10000],
  searchQuery: '',
  sortBy: 'featured',

  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () =>
    set({
      selectedCategories: [],
      priceRange: [0, 10000],
      searchQuery: '',
      sortBy: 'featured',
    }),
}))

interface ThemeState {
  isDark: boolean
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,

      toggleDarkMode: () => {
        set((state) => ({ isDark: !state.isDark }))
      },

      setDarkMode: (isDark) => {
        set({ isDark })
      },
    }),
    {
      name: 'grocery-theme',
      version: 1,
    }
  )
)

interface NotificationState {
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
  }>
  addNotification: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => void
  removeNotification: (id: string) => void
}

export const useNotification = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (message, type, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }))

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }

    return id
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))
