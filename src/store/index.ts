import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  userId: string | null
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  setUserId: (userId: string | null) => void
  saveCartToStorage: () => void
  loadCartFromStorage: (userId: string) => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

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

      setUserId: (userId: string | null) => {
        // Keep cart items across logins/logouts
        set({ userId })
      },

      saveCartToStorage: () => {
        const state = get()
        if (state.userId) {
          localStorage.setItem(`grocery-cart-${state.userId}`, JSON.stringify(state.items))
        }
      },

      loadCartFromStorage: (userId: string) => {
        const saved = localStorage.getItem(`grocery-cart-${userId}`)
        if (saved) {
          try {
            const items = JSON.parse(saved)
            set({ items, userId })
          } catch (e) {
            console.error('Failed to load cart from storage:', e)
            set({ items: [], userId })
          }
        } else {
          set({ items: [], userId })
        }
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
  userId: string | null
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  setUserId: (userId: string | null) => void
  saveWishlistToStorage: () => void
  loadWishlistFromStorage: (userId: string) => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,

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

      setUserId: (userId: string | null) => {
        // Keep wishlist items across logins/logouts
        set({ userId })
      },

      saveWishlistToStorage: () => {
        const state = get()
        if (state.userId) {
          localStorage.setItem(`grocery-wishlist-${state.userId}`, JSON.stringify(state.items))
        }
      },

      loadWishlistFromStorage: (userId: string) => {
        const saved = localStorage.getItem(`grocery-wishlist-${userId}`)
        if (saved) {
          try {
            const items = JSON.parse(saved)
            set({ items, userId })
          } catch (e) {
            console.error('Failed to load wishlist from storage:', e)
            set({ items: [], userId })
          }
        } else {
          set({ items: [], userId })
        }
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
