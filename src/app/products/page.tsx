'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart, useWishlist } from '@/store'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { formatCurrency } from '@/utils'
import type { Product } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  
  // Read category from URL on component mount
  useEffect(() => {
    const cat = searchParams.get('category') || ''
    setCategory(cat)
  }, [searchParams])

  const minPrice = 0
  const maxPrice = 10000
  const sort = 'featured'

  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const { data: response, isLoading } = useQuery({
    queryKey: ['products', page, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
        ...(category && { category }),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        sort,
      })
      console.log('Fetching with params:', params.toString())
      const res = await axios.get(`/api/products?${params}`)
      console.log('Response:', res.data)
      return res.data.data
    },
  })

  const products = response?.products || []
  const pagination = response?.pagination || {}

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, 1)
  }

  const handleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <main className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="container-custom">
        <h1 className="text-h1 mb-4">Products</h1>
        <p className="text-muted-foreground mb-8">
          {category ? `Browsing ${category} products` : 'Browse our wide selection of fresh and organic grocery products'}
        </p>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(12)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No products found in this category.</p>
            </div>
          ) : (
            products.map((product: Product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">
                  {/* Image */}
                  <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.src = `https://picsum.photos/500/500?text=${encodeURIComponent(product.name)}`
                        }}
                      />
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
                      onClick={(e) => {
                        handleWishlist(product.id, e)
                      }}
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
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>
            <Button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
