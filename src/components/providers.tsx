'use client'

import React, { ReactNode, useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useTheme, useCart, useWishlist } from '@/store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function SessionSyncProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const { setUserId: setCartUserId, clearCart, saveCartToStorage, loadCartFromStorage } = useCart()
  const { setUserId: setWishlistUserId, clearWishlist, saveWishlistToStorage, loadWishlistFromStorage } = useWishlist()

  useEffect(() => {
    if (session?.user) {
      // User logged in - load their saved cart and wishlist
      const userId = session.user.email || session.user.id || 'anonymous'
      setCartUserId(userId)
      setWishlistUserId(userId)
      loadCartFromStorage(userId)
      loadWishlistFromStorage(userId)
    } else {
      // User logged out - save current cart/wishlist and clear
      saveCartToStorage()
      saveWishlistToStorage()
      clearCart()
      clearWishlist()
      setCartUserId(null)
      setWishlistUserId(null)
    }
  }, [session, setCartUserId, setWishlistUserId, clearCart, clearWishlist, saveCartToStorage, saveWishlistToStorage, loadCartFromStorage, loadWishlistFromStorage])

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  const { isDark } = useTheme()

  React.useEffect(() => {
    // Apply dark mode to HTML element
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <SessionProvider>
      <SessionSyncProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827',
              },
            }}
          />
        </QueryClientProvider>
      </SessionSyncProvider>
    </SessionProvider>
  )
}
