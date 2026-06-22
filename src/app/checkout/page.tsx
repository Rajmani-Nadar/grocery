import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Checkout',
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container-custom max-w-2xl">
        <h1 className="text-h2 mb-8">Checkout</h1>

        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Select or add a shipping address
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Manage Addresses</Button>
            </Link>
          </div>

          {/* Payment Method */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              {['UPI', 'Credit Card', 'Debit Card', 'Cash on Delivery'].map((method) => (
                <label key={method} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded border border-border cursor-pointer">
                  <input type="radio" name="payment" defaultChecked={method === 'UPI'} />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <p className="text-muted-foreground text-sm">
              Your cart is empty. Add items from the store to proceed.
            </p>
            <Link href="/products">
              <Button className="mt-4">Continue Shopping</Button>
            </Link>
          </div>

          {/* Checkout Button */}
          <Button className="w-full" size="lg">
            Place Order
          </Button>
        </div>
      </div>
    </main>
  )
}
