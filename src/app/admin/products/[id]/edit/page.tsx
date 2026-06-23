'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/admin/product-form'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function EditProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchData()
  }, [status, session, router, productId])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/categories'),
      ])

      if (!productRes.ok) {
        throw new Error('Product not found')
      }

      const productData = await productRes.json()
      const categoriesData = await categoriesRes.json()

      setProduct(productData.data)
      setCategories(categoriesData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load product')
      router.push('/admin/products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }

      const result = await response.json()
      toast.success('Product updated successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || status === 'loading') {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Product not found</p>
            <Link href="/admin/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/products" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">{product.name}</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-8">
          <ProductForm
            initialData={{
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: product.price,
              discountPrice: product.discountPrice || product.price,
              discount: product.discount || 0,
              stock: product.stock,
              sku: product.sku,
              weight: product.weight,
              categoryId: product.categoryId,
              images: product.images,
              isFeatured: product.isFeatured,
              isActive: product.isActive,
            }}
            categories={categories}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitButtonLabel="Update Product"
          />
        </div>
      </div>
    </main>
  )
}
