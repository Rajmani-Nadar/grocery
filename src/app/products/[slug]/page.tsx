'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, ArrowLeft, Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/store'
import { useWishlist } from '@/store'
import { showCartToast, showWishlistToast } from '@/components/ui/action-toast'
import { useSession } from 'next-auth/react'
import { useAuthGate } from '@/components/auth/auth-gate'

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
  reviewCount: number
  sku: string
  weight: number
  category?: {
    name: string
    slug: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  author: string
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { data: session } = useSession()
  const { requireAuth } = useAuthGate()
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await fetch(`/api/products?slug=${slug}`)
      if (!response.ok) throw new Error('Product not found')
      const data = await response.json()
      return data as Product
    },
  })

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category?.slug],
    queryFn: async () => {
      if (!product?.category?.slug) return []
      const response = await fetch(`/api/products?category=${product.category.slug}&limit=4`)
      if (!response.ok) return []
      const data = await response.json()
      return (data.products || []).filter((p: Product) => p.id !== product.id).slice(0, 3)
    },
    enabled: !!product,
  })

  const handleAddToCart = () => {
    if (product) {
      if (!session && !requireAuth({ type: 'cart', productId: product.id, quantity }, 'Login to add products to your cart.')) return
      addItem(product as any, quantity)
      setAddedToCart(true)
      showCartToast(product.name, router)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && (!product || newQuantity <= product.stock)) {
      setQuantity(newQuantity)
    }
  }

  const toggleWishlist = () => {
    if (product) {
      if (!session && !requireAuth({ type: 'wishlist', productId: product.id }, 'Login to save products to your wishlist.')) return
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id)
        toast('Removed from wishlist')
      } else {
        addToWishlist(product.id)
        showWishlistToast(product.name, router)
      }
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">Sorry, the product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const inWishlist = isInWishlist(product.id)

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden aspect-square relative">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.src = '/placeholder.png'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  No Image Available
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? 'border-primary-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Image
                      src={img || '/placeholder.png'}
                      alt={`${product.name}-${idx}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = '/placeholder.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Badge */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-lg transition-colors ${
                    inWishlist
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              {product.discount > 0 && (
                <div className="inline-block bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600">₹{product.discountPrice || product.price}</span>
                {product.discount > 0 && (
                  <span className="text-lg text-gray-500 line-through">₹{product.price}</span>
                )}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Save ₹{(product.price - (product.discountPrice || product.price)).toFixed(0)}
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Product Info */}
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">SKU</p>
                  <p className="font-medium text-foreground">{product.sku}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-medium text-foreground">{product.weight} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock Status</p>
                  <p className={product.stock > 0 ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                    {product.stock > 0 ? `${product.stock} Available` : 'Out of Stock'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">{product.category?.name || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-lg py-2 bg-white dark:bg-slate-800"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-6 text-lg font-semibold flex items-center justify-center gap-2 ${
                addedToCart ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {addedToCart ? (
                <>
                  <Check size={20} />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProducts.map((relatedProduct: Product) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`}>
                  <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={relatedProduct.images?.[0] || '/placeholder.png'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.src = '/placeholder.png'
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground line-through">₹{relatedProduct.price}</p>
                        <p className="font-bold text-primary-600">₹{relatedProduct.discountPrice || relatedProduct.price}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold">{relatedProduct.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
