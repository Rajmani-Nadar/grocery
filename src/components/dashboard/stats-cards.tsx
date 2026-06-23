'use client'

import React, { useState, useEffect } from 'react'
import { useWishlist, useCart } from '@/store'

interface StatsCardsProps {
  totalOrders: number
  totalSpent: number
  rewardPoints: number
}

export function StatsCards({ totalOrders, totalSpent, rewardPoints }: StatsCardsProps) {
  const { items: wishlistItems } = useWishlist()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
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
        <p className="text-3xl font-bold">{wishlistItems.length}</p>
      </div>
      <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
        <p className="text-muted-foreground text-sm mb-2">Reward Points</p>
        <p className="text-3xl font-bold">{rewardPoints}</p>
      </div>
    </div>
  )
}
