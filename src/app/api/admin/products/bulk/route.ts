import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface BulkProductInput {
  name: string
  sku: string
  description?: string
  categoryId: string
  category?: string
  price: number
  discountPrice?: number | null
  discount?: number | null
  stock: number
  weight?: number | null
  isFeatured: boolean
  isActive: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { products } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products provided' },
        { status: 400 }
      )
    }

    const errors: Array<{ row: number; error: string; sku: string }> = []
    const successProducts: Array<{ product: BulkProductInput; row: number }> = []
    let successCount = 0

    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    })
    const categoryIdsByName = new Map(
      categories.map((category) => [category.name.trim().toLowerCase(), category.id])
    )
    const categoryIds = new Set(categories.map((category) => category.id))

    // Validate all products first
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const rowNum = i + 2 // +2 because header is row 1

      const categoryId = product.categoryId ? String(product.categoryId).trim() : ''
      const categoryName = product.category ? String(product.category).trim() : ''
      const resolvedCategoryId = categoryIds.has(categoryId)
        ? categoryId
        : (categoryName ? categoryIdsByName.get(categoryName.toLowerCase()) : undefined)

      if (!resolvedCategoryId) {
        errors.push({
          row: rowNum,
          error: categoryName
            ? `Category "${categoryName}" does not exist.`
            : 'Category name is required.',
          sku: product.sku,
        })
        continue
      }

      // Check if SKU already exists
      const existingSKU = await prisma.product.findUnique({
        where: { sku: product.sku },
      })

      if (existingSKU) {
        errors.push({
          row: rowNum,
          error: `SKU "${product.sku}" already exists`,
          sku: product.sku,
        })
        continue
      }

      successProducts.push({ product: { ...product, categoryId: resolvedCategoryId }, row: rowNum })
    }

    // Create products in bulk
    for (const { product, row } of successProducts) {
      try {
        // Generate slug from name
        const slug = product.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

        await prisma.product.create({
          data: {
            name: product.name,
            slug: slug,
            sku: product.sku,
            description: product.description || null,
            categoryId: product.categoryId,
            price: product.price,
            discountPrice: product.discountPrice || null,
            discount: product.discount || null,
            stock: product.stock,
            weight: product.weight || null,
            isFeatured: product.isFeatured || false,
            isActive: product.isActive === undefined ? true : product.isActive,
            images: [],
            rating: 0,
            reviewCount: 0,
          },
        })

        successCount++
      } catch (error) {
        console.error(`Error creating product ${product.sku}:`, error)
        errors.push({
          row,
          error: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sku: product.sku,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        successCount,
        failedCount: errors.length,
        errors: errors.map((err) => ({
          row: err.row,
          error: err.error,
        })),
      },
    })
  } catch (error) {
    console.error('Error processing bulk upload:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk upload' },
      { status: 500 }
    )
  }
}
