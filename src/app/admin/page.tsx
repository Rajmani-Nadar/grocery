import React from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-h1 mb-8">Admin Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Products</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Revenue</p>
            <p className="text-3xl font-bold">₹0</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Customers</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Product Management</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Add, edit, and manage products. Upload bulk products via CSV or Excel.
            </p>
            <div className="space-y-2">
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                View Products
              </button>
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Add New Product
              </button>
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Bulk Upload (CSV/Excel)
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Order Management</h2>
            <p className="text-muted-foreground text-sm mb-4">
              View, update order status, and manage deliveries.
            </p>
            <div className="space-y-2">
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                View All Orders
              </button>
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Pending Orders
              </button>
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Shipped Orders
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Category Management</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Add, edit, and delete product categories.
            </p>
            <div className="space-y-2">
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                View Categories
              </button>
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Add New Category
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
            <h2 className="font-bold text-lg mb-4">Customer Management</h2>
            <p className="text-muted-foreground text-sm mb-4">
              View customer details and order history.
            </p>
            <div className="space-y-2">
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                View All Customers
              </button>
              <button className="block w-full p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Recent Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
