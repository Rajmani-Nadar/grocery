'use client'

import React from 'react'
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
    <div className="grid md:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="md:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-4xl">{item.product?.name.charAt(0)}</div>
              <div className="flex-1">
                <h3 className="font-bold">{item.product?.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(item.product?.discountPrice || item.product?.price || 0)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                  }
                  className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  −
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-destructive hover:bg-red-50 dark:hover:bg-red-950 rounded"
              >
                <Trash2 size={18} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Summary */}
      <div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{getTotal() > 500 ? 'Free' : formatCurrency(50)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(Math.round(getTotal() * 0.05 * 100) / 100)}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(getTotal() * 1.05 + (getTotal() > 500 ? 0 : 50))}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 gap-2">
            <Link href="/checkout" className="flex-1">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </CardFooter>
        </Card>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={clearCart}
        >
          Clear Cart
        </Button>
      </div>
    </div>
  )
}
