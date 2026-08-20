'use client'

import React from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart, useWishlist } from '@/store'
import { useSession } from 'next-auth/react'
import { useAuthGate } from '@/components/auth/auth-gate'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { formatCurrency } from '@/utils'
import type { Product } from '@/types'

export function FeaturedProducts() {
  const { data: response } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await axios.get('/api/products?featured=true&pageSize=8')
      return res.data.data
    },
  })

  const products = response?.products || []
  const { data: session } = useSession()
  const { requireAuth } = useAuthGate()
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

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

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    if (!session && !requireAuth({ type: 'cart', productId: product.id, quantity: 1 }, 'Login to add products to your cart.')) return
    addItem(product, 1)
    toast.success('Product added to cart')
  }

  const handleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!session && !requireAuth({ type: 'wishlist', productId }, 'Login to save products to your wishlist.')) return
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
      toast('Removed from wishlist')
    } else {
      addToWishlist(productId)
      toast.success('Added to wishlist')
    }
  }

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 mb-4">Featured Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Check out our handpicked selection of premium products
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.length === 0 ? (
            Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))
          ) : (
            products.map((product: Product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <Link href={`/products/${product.slug}`}>
                  <Card className="h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Image */}
                    <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.style.display = 'none'
                            // Don't try to replace with another external image
                            const placeholder = document.createElement('div')
                            placeholder.className = 'w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 text-sm'
                            placeholder.textContent = product.name
                            img.parentElement?.appendChild(placeholder)
                          }}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 text-sm">
                          {product.name}
                        </div>
                      )}

                      {/* Discount Badge */}
                      {product.discount && (
                        <Badge className="absolute top-3 right-3 bg-secondary-500 text-white">
                          -{product.discount}%
                        </Badge>
                      )}

                      {/* Stock Status */}
                      <div className="absolute bottom-3 left-3">
                        {product.stock > 0 ? (
                          <Badge variant="success" className="text-xs">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleWishlist(product.id, e)}
                        className="absolute top-3 left-3 p-2 bg-white dark:bg-slate-900 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Heart
                          size={18}
                          className={`transition-colors ${
                            isInWishlist(product.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <h3 className="font-bold line-clamp-2 mb-2">{product.name}</h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < Math.floor(product.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({product.reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-bold text-lg text-primary-600">
                          {formatCurrency(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="p-4 pt-0">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className="w-full py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <Link href="/products">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
