import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, MapPin, Heart, Settings, LayoutGrid } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/login')
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
                  <Link
                    key={order.id}
                    href={`/dashboard/orders?orderid=${order.id}`}
                  >
                    <div
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{Math.round(order.total)}</p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded inline-block ${
                              order.orderStatus === 'DELIVERED'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : order.orderStatus === 'CANCELLED'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
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
