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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.14),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_32%)] bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="container mx-auto max-w-7xl space-y-8">
          <section className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 p-7 text-white shadow-2xl shadow-emerald-900/15 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 right-24 -z-10 h-72 w-72 rounded-full bg-lime-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="animate-[fade-in-down_400ms_ease-out]">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Admin Workspace</span><span className="rounded-full bg-white/15 px-3 py-1">Store healthy</span></div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {session.user?.name || 'Admin User'} 👋</h1>
                <p className="mt-3 max-w-2xl text-sm text-emerald-50 sm:text-base">A clear view of revenue, customer momentum, and order operations across your store.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><Link href="/admin/products"><Button className="gap-2 !bg-white !text-emerald-700 shadow-lg hover:!bg-emerald-50 hover:!text-emerald-700"><LayoutGrid className="h-4 w-4" />Open Admin Panel</Button></Link></div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, tone: 'from-orange-50 to-white border-orange-200 text-orange-600 shadow-orange-100/60' },
              { label: "Today's Sales", value: `₹${todaySales.toLocaleString('en-IN')}`, icon: BarChart3, tone: 'from-blue-50 to-white border-blue-200 text-blue-600 shadow-blue-100/60' },
              { label: 'Completed Orders', value: completedOrders, icon: Package, tone: 'from-emerald-50 to-white border-emerald-200 text-emerald-600 shadow-emerald-100/60' },
              { label: 'Pending Orders', value: pendingOrders, icon: TrendingUp, tone: 'from-violet-50 to-white border-violet-200 text-violet-600 shadow-violet-100/60' },
            ].map((card, index) => { const Icon = card.icon; return <div key={card.label} className={`group animate-[fade-in-up_450ms_ease-out_both] rounded-3xl border bg-gradient-to-br p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${card.tone}`} style={{ animationDelay: `${index * 70}ms` }}><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{card.label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{card.value}</p></div><div className="rounded-2xl bg-white p-3 shadow-md transition duration-300 group-hover:rotate-6 group-hover:scale-110"><Icon className="h-6 w-6" /></div></div><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-black/5"><div className="h-full w-3/4 rounded-full bg-current opacity-50" /></div></div> })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-xl shadow-slate-200/50 backdrop-blur dark:bg-slate-900/85 dark:shadow-black/20"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-tight">Recent Orders</h2><p className="mt-1 text-sm text-muted-foreground">Latest customer purchases and status updates.</p></div><Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link></div><div className="mt-6 space-y-3">{allOrders.slice(0, 5).map((order, index) => <div key={order.id} className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-slate-50/80 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50 dark:bg-slate-800/60 dark:hover:border-emerald-700"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md">{(order.user?.name || 'Customer').split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="min-w-0"><p className="truncate font-semibold">{order.user?.name || 'Customer'}</p><p className="truncate text-sm text-muted-foreground">{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p></div></div><div className="shrink-0 text-right"><p className="font-bold">₹{Math.round(order.total).toLocaleString('en-IN')}</p><span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">{order.orderStatus.replace(/_/g, ' ')}</span></div></div>)}</div></section>

            <div className="space-y-6"><section className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-xl shadow-slate-200/50 backdrop-blur dark:bg-slate-900/85"><h2 className="text-lg font-semibold">Quick Actions</h2><div className="mt-4 space-y-3">{[{ href: '/admin/products', label: 'Manage Products', description: 'Keep your catalog fresh', icon: Package }, { href: '/admin/categories', label: 'Manage Categories', description: 'Organize your store', icon: Tag }, { href: '/admin/customers', label: 'Manage Customers', description: 'Review customer activity', icon: Users }].map(({ href, label, description, icon: Icon }) => <Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-border/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-50/60 hover:shadow-md dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"><span className="flex items-center gap-3"><span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><Icon className="h-5 w-5" /></span><span><span className="block font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span></span><ArrowRight className="h-4 w-4 text-muted-foreground transition duration-300 group-hover:translate-x-1 group-hover:text-emerald-600" /></Link>)}</div></section>
              <section className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-xl shadow-slate-200/50 backdrop-blur dark:bg-slate-900/85"><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Store Snapshot</h2></div><div className="mt-5 space-y-5">{[{ label: 'Total Products', value: totalProducts, icon: Package, progress: 'w-4/5' }, { label: 'Total Customers', value: totalCustomers, icon: Users, progress: 'w-3/5' }, { label: 'Average Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, icon: DollarSign, progress: 'w-2/3' }].map(({ label, value, icon: Icon, progress }) => <div key={label}><div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</span><span className="font-bold text-foreground">{value}</span></div><div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 ${progress}`} /></div></div>)}</div></section></div>
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
