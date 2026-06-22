import React from 'react'
import { Metadata } from 'next'
import { CartContent } from '@/components/cart/cart-content'

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View and manage your shopping cart',
}

export default function CartPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-h1 mb-8">Shopping Cart</h1>
        <CartContent />
      </div>
    </main>
  )
}
