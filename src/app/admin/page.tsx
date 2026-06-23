import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BarChart3, ShoppingCart, DollarSign, Users, TrendingUp, Calendar, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  // Fetch dashboard data
  const [totalProducts, totalOrders, totalCustomers, allOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      include: {
        items: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Calculate revenue
  const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0)

  // Calculate today's sales
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const todayOrders = allOrders.filter(
    (order) =>
      new Date(order.createdAt) >= today && new Date(order.createdAt) <= todayEnd
  )
  const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0)

  // Get last 10 orders for recent activity
  const recentOrders = allOrders.slice(0, 10)

  // Calculate stats for charts
  const ordersByStatus = {
    pending: allOrders.filter((o) => o.orderStatus === 'PENDING').length,
    processing: allOrders.filter((o) => o.orderStatus === 'PROCESSING').length,
    delivered: allOrders.filter((o) => o.orderStatus === 'DELIVERED').length,
    cancelled: allOrders.filter((o) => o.orderStatus === 'CANCELLED').length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
                <p className="text-4xl font-bold text-foreground mt-2">{totalOrders}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  All time
                </p>
              </div>
              <ShoppingCart size={32} className="text-primary-600 opacity-50" />
            </div>
          </div>

          {/* Today's Sales */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Sales</p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  ₹{todaySales.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                  <Calendar size={14} />
                  {todayOrders.length} order{todayOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
              <DollarSign size={32} className="text-blue-600 opacity-50" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  From {totalOrders} orders
                </p>
              </div>
              <BarChart3 size={32} className="text-green-600 opacity-50" />
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Customers</p>
                <p className="text-4xl font-bold text-foreground mt-2">{totalCustomers}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
                  <Users size={14} />
                  Active users
                </p>
              </div>
              <Users size={32} className="text-purple-600 opacity-50" />
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Products</p>
                <p className="text-4xl font-bold text-foreground mt-2">{totalProducts}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  In stock
                </p>
              </div>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Order Value</p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('en-IN') : '0'}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                  Per order
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Status Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: 'Pending', value: ordersByStatus.pending, color: 'yellow' },
                { label: 'Processing', value: ordersByStatus.processing, color: 'blue' },
                { label: 'Delivered', value: ordersByStatus.delivered, color: 'green' },
                { label: 'Cancelled', value: ordersByStatus.cancelled, color: 'red' },
              ].map((status) => (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${status.color}-500`}
                    ></div>
                    <span className="text-sm text-muted-foreground">{status.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{status.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(1) : '0'}%
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Avg Customer Orders</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(2) : '0'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {totalOrders > 0
                    ? (((totalOrders - ordersByStatus.cancelled) / totalOrders) * 100).toFixed(1)
                    : '0'}
                  %
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <Link href="/admin/orders">
              <div className="flex items-center gap-2 text-primary hover:underline text-sm">
                View All
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4 font-mono text-foreground">
                        #{order.orderNumber?.slice(-6)}
                      </td>
                      <td className="py-3 px-4 text-foreground">{order.user?.name}</td>
                      <td className="py-3 px-4 font-semibold text-primary-600">
                        ₹{(order.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.orderStatus === 'DELIVERED'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : order.orderStatus === 'PROCESSING'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : order.orderStatus === 'PENDING'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link href="/admin/products">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Products</h3>
                  <p className="text-sm text-muted-foreground">Add, edit, or delete products</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Orders</h3>
                  <p className="text-sm text-muted-foreground">View and update orders</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
