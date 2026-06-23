'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  Search,
  Eye,
} from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    if ((session.user as any).role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/orders')
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update order')
      
      const updatedOrder = await response.json()
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)))
      toast.success('Order status updated')
    } catch (error) {
      console.error('Failed to update order:', error)
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(null)
    }
  }

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update order')
      
      const updatedOrder = await response.json()
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)))
      toast.success('Payment status updated')
    } catch (error) {
      console.error('Failed to update order:', error)
      toast.error('Failed to update payment status')
    } finally {
      setIsUpdating(null)
    }
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'ALL' || order.orderStatus === filterStatus

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.total - a.total
      }
    })

  if (isLoading) {
    return (
      <main className="min-h-screen py-12">
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
          <h1 className="text-h2 mb-2">Orders Management</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Order # or customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Order Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md dark:bg-slate-900"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="w-full px-3 py-2 border border-border rounded-md dark:bg-slate-900"
            >
              <option value="date">Newest First</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">&nbsp;</label>
            <Button
              variant="outline"
              className="w-full"
              onClick={fetchOrders}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-md transition"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                      <CardDescription>
                        {order.user?.name} ({order.user?.email})
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order Status</p>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isUpdating === order.id}
                        className="w-full text-sm px-2 py-1 border border-border rounded dark:bg-slate-900"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        disabled={isUpdating === order.id}
                        className="w-full text-sm px-2 py-1 border border-border rounded dark:bg-slate-900"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Items</p>
                      <p className="font-medium">{order.items.length} item(s)</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-medium text-sm capitalize">
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
                    {expandedOrderId === order.id ? 'Hide' : 'Show'} Details
                  </button>

                  {expandedOrderId === order.id && (
                    <div className="space-y-4 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-border">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product?.name}</span>
                              <span className="text-muted-foreground">
                                x{item.quantity} @ ₹{item.price.toFixed(2)} = ₹{item.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div>
                          <h4 className="font-semibold mb-2">Shipping Address</h4>
                          <div className="text-sm space-y-1 text-muted-foreground">
                            <p>{order.shippingAddress.fullName}</p>
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
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Subtotal</p>
                          <p className="font-medium">₹{order.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Shipping</p>
                          <p className="font-medium">₹{order.shippingCharge.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Tax</p>
                          <p className="font-medium">₹{order.tax.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Discount</p>
                          <p className="font-medium">₹{(order.discount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/api/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
