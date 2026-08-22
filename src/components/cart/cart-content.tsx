'use client'

import React from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useCart } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Trash2, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/utils'

export function CartContent() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <ShoppingCart size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Add some products to get started!
        </p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-3 md:gap-8">
      {/* Cart Items */}
      <div className="min-w-0 space-y-4 md:col-span-2">
        {items.map((item) => (
          <Card key={item.id} className="min-w-0 overflow-hidden">
            <CardContent className="flex min-w-0 flex-wrap items-center gap-3 p-4 sm:flex-nowrap sm:gap-4">
              <div className="shrink-0 text-4xl">{item.product?.name.charAt(0)}</div>
              <div className="min-w-0 flex-1 basis-[calc(100%-3.5rem)] sm:basis-auto">
                <h3 className="truncate font-bold">{item.product?.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(item.product?.discountPrice || item.product?.price || 0)}
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                  }
                  className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  −
                </button>
                <span className="px-2 sm:px-4">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => {
                  removeItem(item.productId)
                  toast.success('Item removed from cart')
                }}
                className="shrink-0 rounded p-2 text-destructive hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={18} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div>
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex min-w-0 justify-between gap-4 text-sm">
                  <span>Subtotal</span>
                  <span className="shrink-0">{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex min-w-0 justify-between gap-4 text-sm">
                  <span>Shipping</span>
                  <span className="shrink-0">{getTotal() > 500 ? 'Free' : formatCurrency(50)}</span>
                </div>
                <div className="flex min-w-0 justify-between gap-4 text-sm">
                  <span>Tax</span>
                  <span className="shrink-0">{formatCurrency(Math.round(getTotal() * 0.05 * 100) / 100)}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex min-w-0 justify-between gap-4 font-bold text-lg">
                <span>Total</span>
                <span className="shrink-0">{formatCurrency(getTotal() * 1.05 + (getTotal() > 500 ? 0 : 50))}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2 p-4 pt-0 sm:p-6 sm:pt-0">
            <Link href="/checkout" className="flex-1">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </CardFooter>
        </Card>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => {
            clearCart()
            toast.success('Cart cleared')
          }}
        >
          Clear Cart
        </Button>
      </div>
    </div>
  )
}
