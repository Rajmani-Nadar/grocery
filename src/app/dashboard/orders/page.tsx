'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ChevronDown, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
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
                        View Order
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
