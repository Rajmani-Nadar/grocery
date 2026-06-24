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
import { Heart, ShoppingCart, Star, X } from 'lucide-react'
import { formatCurrency } from '@/utils'
import type { Product, Category } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000)
  const [sort, setSort] = useState('featured')
  const [categories, setCategories] = useState<Category[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Read category and search from URL on component mount
  useEffect(() => {
    const cat = searchParams.get('category') || ''
    const q = searchParams.get('search') || ''
    setCategory(cat)
    setSearch(q)
    setPage(1) // Reset to page 1 when search/category changes
  }, [searchParams])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories')
        setCategories(res.data.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const { data: response, isLoading } = useQuery({
    queryKey: ['products', page, category, search, minPrice, maxPrice, sort],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
        ...(category && { category }),
        ...(search && { search }),
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
        <div className="flex gap-8">
          {/* Sidebar Filters - Hidden on mobile, shown on desktop */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Category
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={category === ''}
                      onChange={(e) => {
                        setCategory(e.target.value)
                        setPage(1)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        checked={category === cat.slug}
                        onChange={(e) => {
                          setCategory(e.target.value)
                          setPage(1)
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Min Price: ₹{minPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={minPrice}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        // Ensure minPrice doesn't exceed maxPrice
                        if (val <= maxPrice) {
                          setMinPrice(val)
                          setPage(1)
                        }
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Max Price: ₹{maxPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        // Ensure maxPrice is at least minPrice
                        if (val >= minPrice) {
                          setMaxPrice(val)
                          setPage(1)
                        }
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700 p-2 rounded">
                    Selected Range: ₹{minPrice} - ₹{maxPrice}
                  </div>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Sort By
                </h4>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setCategory('')
                  setMinPrice(0)
                  setMaxPrice(10000)
                  setSort('featured')
                  setPage(1)
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h1 className="text-2xl font-bold">Products</h1>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm"
                >
                  Filters
                </button>
              </div>
              <h1 className="text-h1 mb-4 hidden lg:block">Products</h1>
              <p className="text-muted-foreground">
                {search 
                  ? `Search results for "${search}"` 
                  : category 
                  ? `Browsing selected category` 
                  : 'Browse our wide selection of fresh and organic grocery products'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-muted-foreground text-lg">
                    {search 
                      ? `No products found matching "${search}". Try a different search term.`
                      : category
                      ? `No products found in this category.`
                      : 'No products available.'}
                  </p>
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
        </div>
      </div>
    </main>
  )
}
