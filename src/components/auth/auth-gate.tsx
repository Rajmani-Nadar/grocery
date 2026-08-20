'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCart, useWishlist } from '@/store'
import { AuthModal } from '@/components/auth/auth-modal'
import { clearPendingAction, readPendingAction, savePendingAction, type PendingAction } from '@/lib/pending-action'

interface AuthGateContextValue {
  requireAuth: (action: PendingAction, message?: string) => boolean
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null)

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addItem } = useCart()
  const { addItem: addWishlistItem } = useWishlist()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('Login to continue shopping.')

  const requireAuth = (action: PendingAction, nextMessage = 'Login to continue shopping.') => {
    if (status === 'authenticated') return true

    savePendingAction(action)
    setMessage(nextMessage)
    setIsOpen(true)
    return false
  }

  useEffect(() => {
    if (status !== 'authenticated') return

    const action = readPendingAction()
    if (!action) return

    clearPendingAction()
    const finish = async () => {
      if (action.type === 'wishlist') {
        addWishlistItem(action.productId)
        toast.success('Added to wishlist')
        return
      }

      const response = await fetch(`/api/products?id=${encodeURIComponent(action.productId)}`)
      const product = await response.json()
      if (!response.ok || !product?.id) {
        toast.error('Unable to continue that action')
        return
      }

      if (action.type === 'cart' || action.type === 'buy-now') {
        addItem(product, action.quantity)
      }

      if (action.type === 'buy-now') {
        router.push('/checkout')
      } else if (action.type === 'review') {
        router.push(`/products/${product.slug}#reviews`)
      } else {
        toast.success('Product added to cart')
      }
    }

    finish().catch(() => toast.error('Unable to continue that action'))
  }, [status, addItem, addWishlistItem, router])

  const handleAuthenticated = async (email: string, password: string) => {
    const result = await signIn('credentials', { email, password, redirect: false })
    if (!result?.ok) throw new Error(result?.error || 'Unable to sign in')
    setIsOpen(false)
  }

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      <AuthModal
        open={isOpen}
        message={message}
        onClose={() => setIsOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </AuthGateContext.Provider>
  )
}

export function useAuthGate() {
  const context = useContext(AuthGateContext)
  if (!context) throw new Error('useAuthGate must be used inside AuthGateProvider')
  return context
}