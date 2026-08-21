import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RetryPaymentButton } from '@/components/payment/retry-payment-button'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, MapPin, Heart, Settings, LayoutGrid, BarChart3, DollarSign, Package, TrendingUp, Users, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any)?.role || 'CUSTOMER'

  if (userRole === 'ADMIN') {
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

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayOrders = allOrders.filter(
      (order) => new Date(order.createdAt) >= today && new Date(order.createdAt) <= todayEnd
    )
    const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const completedOrders = allOrders.filter((order) => order.orderStatus === 'DELIVERED').length
    const pendingOrders = allOrders.filter((order) => order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING').length
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">Admin Workspace</p>
              <h1 className="text-3xl font-bold text-foreground">Sales overview for {session.user?.name || 'the store'}</h1>
              <p className="text-muted-foreground mt-2">Track revenue, order activity, and inventory from one place.</p>
            </div>
            <Link href="/admin/products">
              <Button className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Open Admin Panel
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm dark:border-orange-900/40 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="mt-2 text-3xl font-semibold">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
                  <p className="mt-2 text-3xl font-semibold">₹{todaySales.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                  <p className="mt-2 text-3xl font-semibold">{completedOrders}</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-900/40 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="mt-2 text-3xl font-semibold">{pendingOrders}</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                  <p className="text-sm text-muted-foreground">Latest customer purchases and status updates.</p>
                </div>
                <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-6 space-y-3">
                {allOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.user?.name || 'Customer'} • {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{Math.round(order.total)}</p>
                      <p className="text-xs text-muted-foreground">{order.orderStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <div className="mt-4 space-y-3">
                  <Link href="/admin/products" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Manage Products</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link href="/admin/categories" className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Manage Categories</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link href="/admin/customers" className="group flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:-translate-y-0.5 hover:border-green-400 hover:bg-green-50 dark:hover:border-green-600 dark:hover:bg-green-900/20">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4 text-green-600 dark:text-green-400" /> Manage Customers</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-green-600 dark:group-hover:text-green-400" />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Store Snapshot</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between"><span>Total Products</span><span className="font-semibold text-foreground">{totalProducts}</span></div>
                  <div className="flex items-center justify-between"><span>Total Customers</span><span className="font-semibold text-foreground">{totalCustomers}</span></div>
                  <div className="flex items-center justify-between"><span>Average Order Value</span><span className="font-semibold text-foreground">₹{avgOrderValue.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      wishlist: true,
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Calculate stats
  const totalOrders = user.orders.length
  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
  const rewardPoints = Math.floor(totalSpent * 0.1) // 10% of spent amount as reward points

  const paymentStatusClasses: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    CAPTURED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    REFUNDED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  }

  const orderStatusClasses: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    PROCESSING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <main className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-h2 mb-2">Welcome, {session.user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Manage your account and view your activity</p>
        </div>

        <StatsCards totalOrders={totalOrders} totalSpent={totalSpent} rewardPoints={rewardPoints} />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Links */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/orders"
                className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span className="font-medium">My Orders</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition group"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium">Addresses</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition group"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-medium">Wishlist</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="font-medium">Cart</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/products"
                  className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition group border-t border-border"
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-orange-600 dark:text-orange-400">Admin Panel</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                </Link>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-primary text-sm hover:underline flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {user.orders.length > 0 ? (
              <div className="space-y-3">
                {user.orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-border bg-slate-50 p-4 dark:bg-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="font-bold">₹{Math.round(order.total)}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Payment:</span>
                      <span className="font-medium">{order.paymentMethod.replace(/_/g, ' ')}</span>
                      <span className={`rounded px-2 py-1 font-medium ${paymentStatusClasses[order.paymentStatus] || 'bg-slate-200 text-slate-700'}`}>
                        Payment {order.paymentStatus}
                      </span>
                      <span className={`rounded px-2 py-1 font-medium ${orderStatusClasses[order.orderStatus] || 'bg-slate-200 text-slate-700'}`}>
                        Order {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/orders?orderid=${order.id}`} className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700">
                        View Order
                      </Link>
                      {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                        <span className="text-xs text-muted-foreground">Cash on Delivery</span>
                      ) : order.paymentStatus === 'PENDING' && order.paymentMethod === 'UPI' ? (
                        <RetryPaymentButton orderId={order.id} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">No orders yet</p>
                <Link href="/products">
                  <Button className="mt-4 w-full">Start Shopping</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
