'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Package,
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock3,
  XCircle,
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

      const matchesStatus = filterStatus === 'ALL' ||
        order.orderStatus === filterStatus ||
        (filterStatus === 'PAID' && ['PAID', 'COMPLETED', 'CAPTURED'].includes(order.paymentStatus)) ||
        (filterStatus === 'FAILED' && ['FAILED', 'CANCELLED'].includes(order.paymentStatus)) ||
        (filterStatus === 'COD' && order.paymentMethod === 'CASH_ON_DELIVERY')

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.total - a.total
      }
    })

  const pendingOrders = orders.filter((order) => order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING').length
  const paidOrders = orders.filter((order) => ['PAID', 'COMPLETED', 'CAPTURED'].includes(order.paymentStatus)).length
  const codOrders = orders.filter((order) => order.paymentMethod === 'CASH_ON_DELIVERY').length
  const paidRevenue = orders.reduce((sum, order) => ['PAID', 'COMPLETED', 'CAPTURED'].includes(order.paymentStatus) ? sum + order.total : sum, 0)

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
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)] px-3 py-6 sm:px-4 sm:py-10">
      <div className="container-custom space-y-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 p-7 text-white shadow-xl shadow-emerald-900/15 sm:p-9"><div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" /><div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-3 flex items-center gap-3"><span className="rounded-2xl bg-white/15 p-3"><Package className="h-6 w-6" /></span><span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Operations</span></div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Orders Management</h1><p className="mt-2 text-sm text-emerald-50">Manage and track every customer order from one focused workspace.</p></div><div className="flex flex-wrap gap-2 text-sm font-medium"><span className="rounded-full border border-white/20 bg-white/15 px-4 py-2">{orders.length} total orders</span><span className="rounded-full border border-amber-200/30 bg-amber-400/20 px-4 py-2 text-amber-50">{pendingOrders} pending</span></div></div></section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[{ label: 'Total Orders', value: orders.length, icon: Package, tone: 'from-emerald-50 to-white text-emerald-600 border-emerald-200' }, { label: 'Pending Orders', value: pendingOrders, icon: Clock3, tone: 'from-amber-50 to-white text-amber-600 border-amber-200' }, { label: 'Paid Orders', value: paidOrders, icon: CheckCircle2, tone: 'from-blue-50 to-white text-blue-600 border-blue-200' }, { label: 'COD Orders', value: codOrders, icon: Banknote, tone: 'from-violet-50 to-white text-violet-600 border-violet-200' }, { label: 'Paid Revenue', value: `₹${paidRevenue.toLocaleString('en-IN')}`, icon: DollarSign, tone: 'from-teal-50 to-white text-teal-600 border-teal-200' }].map(({ label, value, icon: Icon, tone }, index) => <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4 }} className={`rounded-3xl border bg-gradient-to-br p-5 shadow-lg shadow-slate-200/50 dark:from-slate-900 dark:to-slate-800 dark:shadow-black/20 ${tone}`}><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-bold text-foreground">{value}</p></div><Icon className="h-6 w-6" /></div></motion.div>)}</div>

        {/* Filters */}
        <div className="grid gap-4 rounded-3xl border border-border/70 bg-white/85 p-5 shadow-xl shadow-slate-200/50 backdrop-blur md:grid-cols-4 dark:bg-slate-900/85 dark:shadow-black/20">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Order # or customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full pl-9 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Order Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-full border border-border bg-background px-3 py-2 dark:bg-slate-900"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="COD">COD</option>
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
              className="w-full rounded-full border border-border bg-background px-3 py-2 dark:bg-slate-900"
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
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                whileHover={{ y: -2 }}
                className="overflow-hidden rounded-3xl border border-border/70 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur dark:bg-slate-900/90 dark:shadow-black/20"
              >
                <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                  <div className="flex flex-col items-start justify-between gap-3 mb-2 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md">{(order.user?.name || 'Customer').split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                      <div className="min-w-0">
                      <CardTitle className="break-words text-base">{order.orderNumber}</CardTitle>
                      <CardDescription className="break-words">
                        {order.user?.name} ({order.user?.email})
                      </CardDescription>
                      </div>
                    </div>
                    <div className="flex w-full items-start justify-between gap-3 text-left sm:w-auto sm:block sm:text-right">
                      <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex flex-wrap justify-end gap-1"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">{order.paymentStatus}</span><span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">{order.orderStatus.replace(/_/g, ' ')}</span></div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <div className="mb-4 grid gap-4 rounded-2xl border border-border/60 bg-slate-50/80 p-4 md:grid-cols-4 dark:bg-slate-800/70">
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
                            <div key={item.id} className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                              <span className="break-words">{item.product?.name}</span>
                              <span className="text-muted-foreground sm:text-right">
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
                        <div className="col-span-2 border-t border-border pt-3">
                          <p className="text-muted-foreground mb-1">Final Amount</p>
                          <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/order-success/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
