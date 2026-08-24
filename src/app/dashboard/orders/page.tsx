'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, BadgeCheck, CalendarDays, Loader2, ChevronDown, Package, Clock, CheckCircle, Home, Truck, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'
import toast from 'react-hot-toast'
import { RetryPaymentButton } from '@/components/payment/retry-payment-button'

function OrdersContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  // Auto-expand order from query params
  useEffect(() => {
    const orderId = searchParams.get('orderid')
    if (orderId) {
      setExpandedOrderId(orderId)
    }
  }, [searchParams])

  useEffect(() => {
    if (!session?.user?.email) {
      router.push('/auth/login')
      return
    }

    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PENDING':
      case 'PROCESSING':
      case 'CONFIRMED':
      case 'PACKED':
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'CANCELLED':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'CANCELLED':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'PENDING':
      case 'PROCESSING':
      case 'CONFIRMED':
      case 'PACKED':
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

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

  const renderTimeline = (order: Order, compact = false) => {
    const currentIndex = getTimelineIndex(order)
    const cancelled = order.orderStatus === 'CANCELLED'
    const displayIndex = cancelled ? Math.max(0, currentIndex) : currentIndex
    return <section aria-label="Order tracking timeline" className={compact ? 'mt-4 rounded-xl border border-border bg-slate-50 p-3 dark:bg-slate-800' : 'rounded-2xl border border-border bg-white/70 p-4 dark:bg-slate-900/70'}>
      {(order.paymentStatus === 'FAILED' || order.orderStatus === 'PAYMENT_FAILED') && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">Payment Failed: please retry payment to continue this order.</div>}
      <ol className={`flex ${compact ? 'items-center' : 'flex-col gap-4 md:flex-row md:gap-0'} relative`}>
        {timelineSteps.map((step, index) => {
          const Icon = step.icon
          const complete = index < displayIndex || (!cancelled && index === displayIndex && order.orderStatus === 'DELIVERED')
          const current = !cancelled && index === displayIndex
          const disabled = cancelled && index > displayIndex
          return <li key={step.status} className={`relative flex ${compact ? 'flex-1 flex-col items-center' : 'flex-1 items-center gap-3 md:block md:text-center'}`}>
            {index > 0 && <span className={`absolute ${compact ? 'left-0 top-4 h-0.5 w-full -translate-x-1/2' : 'left-5 top-[-1rem] h-4 w-0.5 md:left-1/2 md:top-5 md:h-0.5 md:w-full md:-translate-x-full'} ${complete || current ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} aria-hidden="true" />}
            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${complete || current ? 'border-emerald-500 bg-emerald-500 text-white' : disabled ? 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800' : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900'} ${current ? 'animate-pulse shadow-md shadow-emerald-300/60' : ''}`} aria-current={current ? 'step' : undefined} aria-label={`${step.label}${current ? ', current step' : ''}`}><Icon className="h-4 w-4" /></div>
            {!compact && <div className="mt-2"><p className={`text-sm font-semibold ${disabled ? 'text-slate-400' : ''}`}>{step.label}</p>{index === 0 && <p className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>}{step.status === 'DELIVERED' && order.deliveredAt && <p className="text-[11px] text-muted-foreground">{new Date(order.deliveredAt).toLocaleDateString('en-IN')}</p>}</div>}
          </li>
        })}
      </ol>
      {compact && <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground"><span>Pending</span><span>Delivered</span></div>}
      {cancelled && <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><XCircle className="h-4 w-4" />Order Cancelled. Cancellation reason will be provided by the store.</div>}
    </section>
  }

  if (isLoading) {
    return (
      <main className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
        <div className="container-custom flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-h2 mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage all your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to place your first order
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getStatusIcon(order.orderStatus)}
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {renderTimeline(order, true)}
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Items</p>
                      <p className="font-semibold">{order.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                      <p className="font-semibold text-sm">{order.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-semibold text-sm">
                        {order.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.id ? null : order.id
                      )
                    }
                    className="flex items-center gap-2 text-primary text-sm hover:underline mb-3"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition ${
                        expandedOrderId === order.id ? 'rotate-180' : ''
                      }`}
                    />
                    {expandedOrderId === order.id ? 'Hide' : 'View'} Details
                  </button>

                  {expandedOrderId === order.id && (
                    <div className="space-y-4 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-border">
                      {renderTimeline(order)}
                      <div className="grid gap-3 rounded-xl border border-border bg-white/70 p-4 text-sm dark:bg-slate-900/70 sm:grid-cols-2"><div><p className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-emerald-600" />Estimated Delivery</p><p className="mt-2 text-muted-foreground">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "We'll update your estimated delivery date once your order is shipped."}</p></div><div><p className="font-semibold">Delivery Progress</p><div className="mt-2 grid grid-cols-2 gap-1 text-muted-foreground"><span>Order</span><span className="text-right font-medium text-foreground">{order.orderNumber}</span><span>Payment</span><span className="text-right font-medium text-foreground">{order.paymentStatus}</span><span>Status</span><span className="text-right font-medium text-foreground">{order.orderStatus.replace(/_/g, ' ')}</span></div></div></div>
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div className="flex-1">
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">
                                ₹{item.total.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div>
                          <h4 className="font-semibold mb-2">Delivery Address</h4>
                          <div className="text-sm space-y-1 text-muted-foreground">
                            <p className="font-medium text-foreground">
                              {order.shippingAddress.fullName}
                            </p>
                            <p>{order.shippingAddress.phone}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            {order.shippingAddress.addressLine2 && (
                              <p>{order.shippingAddress.addressLine2}</p>
                            )}
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.postalCode}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="border-t border-border pt-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>₹{order.shippingCharge.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>₹{order.tax.toFixed(2)}</span>
                          </div>
                          {order.discount !== undefined && order.discount !== null && order.discount > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>Discount</span>
                              <span>-₹{order.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
                            <span>Total</span>
                            <span>₹{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {order.paymentStatus === 'PENDING' && order.orderStatus === 'PENDING' && (
                      <RetryPaymentButton orderId={order.id} onSuccess={fetchOrders} />
                    )}
                    <Link href={`/order-success/${order.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Tracking
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

import { Suspense } from 'react'

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
        <div className="container-custom flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    }>
      <OrdersContent />
    </Suspense>
  )
}
