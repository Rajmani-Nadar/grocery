import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our collection of fresh groceries',
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <h1 className="text-h1 mb-4">Products</h1>
        <p className="text-muted-foreground mb-8">
          Browse our wide selection of fresh and organic grocery products
        </p>

        {/* Products Grid - To be populated with dynamic content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
              />
            ))}
        </div>
      </div>
    </main>
  )
}
