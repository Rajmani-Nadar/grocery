import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
      orders: true,
      wishlist: true,
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  // Calculate stats
  const totalOrders = user.orders.length
  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
  const wishlistItems = user.wishlist.length
  const rewardPoints = Math.floor(totalSpent * 0.1) // 10% of spent amount as reward points

  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-h1 mb-8">Welcome, {session.user?.name}!</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Spent</p>
            <p className="text-3xl font-bold">₹{Math.round(totalSpent)}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Wishlist Items</p>
            <p className="text-3xl font-bold">{wishlistItems}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Reward Points</p>
            <p className="text-3xl font-bold">{rewardPoints}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link href="#" className="block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                My Orders
              </Link>
              <Link href="#" className="block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                My Addresses
              </Link>
              <Link href="#" className="block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                My Wishlist
              </Link>
              <Link href="#" className="block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Profile Settings
              </Link>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
            {user.orders.length > 0 ? (
              <div className="space-y-3">
                {user.orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-muted-foreground text-xs">₹{Math.round(order.total)} • {order.orderStatus}</p>
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
