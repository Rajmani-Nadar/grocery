'use client'

import React, { ReactNode, useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useTheme, useCart, useWishlist } from '@/store'
import { AuthGateProvider } from '@/components/auth/auth-gate'

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
      loadCartFromStorage(userId)
      loadWishlistFromStorage(userId)
      setCartUserId(userId)
      setWishlistUserId(userId)
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
          <AuthGateProvider>{children}</AuthGateProvider>
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
