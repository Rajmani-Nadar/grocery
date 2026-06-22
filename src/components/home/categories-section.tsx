'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent } from '@/components/ui/card'
import type { Category } from '@types'

const iconMap: Record<string, string> = {
  Fruits: '🍎',
  Vegetables: '🥦',
  Dairy: '🥛',
  Bakery: '🥐',
  Beverages: '☕',
  Snacks: '🍪',
  'Frozen Foods': '❄️',
  Organic: '🌿',
  'Household Items': '🧹',
  'Personal Care': '🧴',
}

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories')
      return res.data.data as Category[]
    },
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 mb-4">Shop by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse through our wide range of fresh products organized by category
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {isLoading ? (
            Array(10)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={`/products?category=${category.slug}`}>
                  <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600">
                    <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center space-y-3">
                      <div className="text-5xl">
                        {iconMap[category.name] || '🛍️'}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{category.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.description?.substring(0, 20)}...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  )
}
