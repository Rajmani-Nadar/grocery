'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Clock3, Loader2, Truck } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'
import { RetryPaymentButton } from '@/components/payment/retry-payment-button'

const OrderCelebration = dynamic(
  () => import('@/components/celebration/OrderCelebration'),
  { ssr: false }
)

export default function OrderSuccessPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, router])

  useEffect(() => {
    if (mounted && orderId) {
      fetchOrder()
    }
  }, [mounted, orderId])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) throw new Error('Failed to fetch order')
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Processing your order...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen py-12">
        <div className="container-custom max-w-2xl text-center">
          <h1 className="text-h2 mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find your order. Please contact support.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    )
  }

  const isCashOnDelivery = order.paymentMethod === 'CASH_ON_DELIVERY'
  const isPaymentPending = order.paymentMethod === 'UPI' && order.paymentStatus === 'PENDING'
  const isPaymentFailed = order.paymentStatus === 'FAILED'
  const isPaymentSuccessful = order.paymentStatus === 'PAID'
  const shouldShowRetry = isPaymentPending

  const state = isCashOnDelivery
    ? {
        title: 'Order Confirmed (Cash on Delivery)',
        subtitle: 'Your order has been placed successfully. Pay when it is delivered.',
        icon: <Truck className="h-16 w-16 text-green-500" />,
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        badgeText: 'Cash on Delivery',
      }
    : isPaymentPending
      ? {
          title: 'Payment Pending',
          subtitle: 'Your order has been created but payment is pending. Complete your payment to confirm this order.',
          icon: <Clock3 className="h-16 w-16 text-amber-500" />,
          badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
          badgeText: 'Pending',
        }
      : isPaymentFailed
        ? {
            title: 'Payment Failed',
            subtitle: 'Your order is waiting for payment. Please try again.',
            icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
            badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            badgeText: 'Failed',
          }
        : {
            title: 'Order Confirmed!',
            subtitle: isPaymentSuccessful
              ? 'Your payment was successful and your order has been confirmed.'
              : 'Your order status has been updated.',
            icon: <CheckCircle className="h-16 w-16 text-green-500" />,
            badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            badgeText: order.paymentStatus,
          }

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <div className="container-custom max-w-xl">
        {isPaymentSuccessful ? <OrderCelebration /> : null}
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={isPaymentSuccessful ? 'animate-bounce' : ''}>{state.icon}</div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{state.title}</h1>
          <p className="text-muted-foreground">{state.subtitle}</p>
        </div>

        {/* Essential Order Info */}
        <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Order Number</p>
              <p className="font-bold text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total Amount</p>
              <p className="font-bold text-lg text-green-600">₹{order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Items</p>
              <p className="font-semibold">{order.items.length} item(s)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${state.badgeClass}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (GST 5%)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <span>Total Paid</span>
              <span className="text-green-600">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
              <span className={`inline-block rounded px-2 py-1 text-sm font-semibold ${state.badgeClass}`}>
                {state.badgeText}
              </span>
            </div>
            {shouldShowRetry && (
              <RetryPaymentButton orderId={order.id} onSuccess={fetchOrder} />
            )}
          </div>
        </div>

        {/* Delivery Address (Minimal) */}
        {order.shippingAddress && (
          <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-6 mb-6">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Delivering To</p>
            <p className="font-semibold mb-1">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.addressLine1}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link href={`/dashboard/orders?orderid=${order?.id}`} className="w-full">
            <Button className="w-full">View Order Details</Button>
          </Link>
          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </Link>
        </div>

        {/* Info Message */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          A confirmation email has been sent. You can track your order from the dashboard.
        </p>
      </div>
    </main>
  )
}
