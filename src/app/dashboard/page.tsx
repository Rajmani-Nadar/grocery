import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-h1 mb-8">Welcome, {session.user?.name}!</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Spent</p>
            <p className="text-3xl font-bold">₹0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Wishlist Items</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Reward Points</p>
            <p className="text-3xl font-bold">0</p>
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
            <p className="text-muted-foreground text-sm">No orders yet</p>
            <Link href="/products">
              <Button className="mt-4 w-full">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
