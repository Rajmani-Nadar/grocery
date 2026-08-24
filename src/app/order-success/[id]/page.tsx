'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BadgeCheck, CalendarDays, CheckCircle, Clock, Home, Loader2, Package, Truck, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'
import { RetryPaymentButton } from '@/components/payment/retry-payment-button'

const OrderCelebration = dynamic(
  () => import('@/components/celebration/OrderCelebration'),
  { ssr: false }
)

const orderStateConfig = {
  PENDING: {
    title: 'Order Confirmed!',
    subtitle: 'Your order has been placed successfully and is awaiting confirmation.',
    icon: CheckCircle,
    iconClass: 'text-green-500',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    accentClass: 'bg-amber-100 dark:bg-amber-900/30',
  },
  CONFIRMED: {
    title: 'Order Confirmed!',
    subtitle: 'Your order has been confirmed and is being prepared for processing.',
    icon: CheckCircle,
    iconClass: 'text-green-500',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    accentClass: 'bg-green-100 dark:bg-green-900/30',
  },
  PROCESSING: {
    title: 'Order Processing',
    subtitle: 'Your order is being prepared.',
    icon: Package,
    iconClass: 'text-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    accentClass: 'bg-orange-100 dark:bg-orange-900/30',
  },
  SHIPPED: {
    title: 'Order Shipped',
    subtitle: 'Your order is on the way.',
    icon: Truck,
    iconClass: 'text-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    accentClass: 'bg-blue-100 dark:bg-blue-900/30',
  },
  DELIVERED: {
    title: 'Order Delivered',
    subtitle: 'Thank you for shopping with us. We hope you enjoy your order.',
    icon: CheckCircle,
    iconClass: 'text-green-500',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    accentClass: 'bg-green-100 dark:bg-green-900/30',
  },
  CANCELLED: {
    title: 'Order Cancelled',
    subtitle: 'This order has been cancelled. If payment was completed, any refund will be processed according to store policy.',
    icon: XCircle,
    iconClass: 'text-red-500',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    accentClass: 'bg-red-100 dark:bg-red-900/30',
  },
} as const

const timelineSteps = [
  { status: 'PENDING', label: 'Pending', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: BadgeCheck },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: Home },
] as const

const getTimelineIndex = (order: Order) => {
  if (order.paymentMethod === 'CASH_ON_DELIVERY' && order.orderStatus === 'PENDING') return 1
  const status = order.orderStatus === 'PACKED' || order.orderStatus === 'OUT_FOR_DELIVERY' ? 'SHIPPED' : order.orderStatus
  return Math.max(0, timelineSteps.findIndex((step) => step.status === status))
}

function OrderTimeline({ order }: { order: Order }) {
  const currentIndex = getTimelineIndex(order)
  const isCancelled = order.orderStatus === 'CANCELLED'
  const isPaymentFailed = order.paymentStatus === 'FAILED' || order.orderStatus === 'PAYMENT_FAILED'
  const displayIndex = isCancelled ? Math.max(0, currentIndex) : currentIndex

  return (
    <section aria-label="Order tracking timeline" className="mb-6 rounded-2xl border border-border bg-white/80 p-5 shadow-sm dark:bg-slate-900/80 sm:p-6">
      {isPaymentFailed && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">Payment Failed: please retry payment to continue this order.</div>}
      <ol className="flex flex-col gap-4 md:flex-row md:items-start md:gap-0">
        {timelineSteps.map((step, index) => {
          const Icon = step.icon
          const completed = index < displayIndex || (!isCancelled && index === displayIndex && order.orderStatus === 'DELIVERED')
          const current = !isCancelled && index === displayIndex
          const disabled = isCancelled && index > displayIndex
          return (
            <li key={step.status} className="relative flex flex-1 items-center gap-3 md:block md:text-center">
              {index > 0 && <span className={`absolute left-5 top-[-1rem] h-4 w-0.5 md:left-1/2 md:top-5 md:h-0.5 md:w-full md:-translate-x-full ${completed || current ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} aria-hidden="true" />}
              <div className={`relative z-10 mx-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition md:mx-auto ${completed || current ? 'border-emerald-500 bg-emerald-500 text-white' : disabled ? 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800' : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900'} ${current ? 'animate-pulse shadow-lg shadow-emerald-300/60' : ''}`} aria-current={current ? 'step' : undefined} aria-label={`${step.label}${current ? ', current step' : ''}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="md:mt-2"><p className={`text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-foreground'}`}>{step.label}</p>{index === 0 && <p className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>}{step.status === 'DELIVERED' && order.deliveredAt && <p className="text-[11px] text-muted-foreground">{new Date(order.deliveredAt).toLocaleDateString('en-IN')}</p>}</div>
            </li>
          )
        })}
      </ol>
      {isCancelled && <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><XCircle className="h-5 w-5" />Order Cancelled. Cancellation reason will be provided by the store.</div>}
    </section>
  )
}

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

  const isPaymentPending = order.paymentMethod === 'UPI' && order.paymentStatus === 'PENDING'
  const isPaymentSuccessful = order.paymentStatus === 'PAID'
  const isCancelled = order.orderStatus === 'CANCELLED'
  const shouldShowRetry = isPaymentPending
  const state = orderStateConfig[order.orderStatus as keyof typeof orderStateConfig] ?? orderStateConfig.PENDING
  const paymentBadgeClass = order.paymentStatus === 'PAID'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    : order.paymentStatus === 'FAILED'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'

  return (
    <main className="min-h-screen py-12 bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
      <div className="container-custom max-w-xl">
        {isPaymentSuccessful && !isCancelled ? <OrderCelebration /> : null}
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`rounded-full p-3 ${state.accentClass} ${isPaymentSuccessful && !isCancelled ? 'animate-bounce' : ''}`}>
              <state.icon className={`h-16 w-16 ${state.iconClass}`} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{state.title}</h1>
          <p className="text-muted-foreground">{state.subtitle}</p>
        </div>

        <OrderTimeline order={order} />

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white/80 p-5 shadow-sm dark:bg-slate-900/80"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-emerald-600" />Estimated Delivery</div><p className="mt-3 font-semibold">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "We'll update your estimated delivery date once your order is shipped."}</p></div>
          <div className="rounded-2xl border border-border bg-white/80 p-5 shadow-sm dark:bg-slate-900/80"><p className="text-sm font-semibold">Delivery Progress</p><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><span className="text-muted-foreground">Order</span><span className="text-right font-semibold">{order.orderNumber}</span><span className="text-muted-foreground">Payment</span><span className="text-right font-semibold">{order.paymentStatus}</span><span className="text-muted-foreground">Method</span><span className="text-right font-semibold">{order.paymentMethod.replace(/_/g, ' ')}</span><span className="text-muted-foreground">Status</span><span className="text-right font-semibold">{order.orderStatus.replace(/_/g, ' ')}</span></div></div>
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
                <span className={`inline-block rounded px-2 py-1 text-sm font-semibold ${paymentBadgeClass}`}>
                {order.paymentStatus}
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
