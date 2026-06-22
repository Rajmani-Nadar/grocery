'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWishlist, useCart } from '@/store'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discountPrice: number
  discount: number
  images: string[]
  stock: number
  rating: number
}

export default function WishlistPage() {
  const { items: wishlistItems, removeItem } = useWishlist()
  const { addItem } = useCart()
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch wishlist products
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.length === 0) {
        setProducts([])
        return
      }

      setLoading(true)
      try {
        const productPromises = wishlistItems.map((id) =>
          fetch(`/api/products?slug=${id}`).then((r) => r.json())
        )
        const results = await Promise.all(productPromises)
        setProducts(results.filter((p) => p && p.id))
      } catch (error) {
        console.error('Error fetching wishlist products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistProducts()
  }, [wishlistItems])

  const handleAddToCart = (product: Product) => {
    addItem(product as any, 1)
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId)
  }

  if (!mounted) {
    return null
  }

  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link href="/products">
            <Button variant="outline" className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Back to Products
            </Button>
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center">
            <Heart size={48} className="mx-auto mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Your Wishlist is Empty
            </h1>
            <p className="text-muted-foreground mb-6">
              Start adding products to your wishlist to keep track of items you love!
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link href="/products">
          <Button variant="outline" className="mb-6">
            <ArrowLeft size={18} className="mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            You have {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-muted-foreground">Loading wishlist...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden group">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = '/placeholder.png'
                      }}
                      unoptimized
                    />
                  </Link>
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <Link href={`/products/${product.slug}`} className="block hover:text-primary-600">
                    <h3 className="font-semibold text-foreground line-clamp-2">{product.name}</h3>
                  </Link>

                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 line-through">₹{product.price}</p>
                      <p className="text-lg font-bold text-primary-600">
                        ₹{product.discountPrice || product.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-500 font-semibold">★ {product.rating}</p>
                    </div>
                  </div>

                  <p className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Add to Cart
                    </Button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
