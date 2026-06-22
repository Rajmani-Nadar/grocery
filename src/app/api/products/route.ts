import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // If slug or id is provided, return single product
    if (slug || id) {
      const product = await prisma.product.findFirst({
        where: slug 
          ? { slug, isActive: true }
          : { id, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          discountPrice: true,
          discount: true,
          images: true,
          rating: true,
          reviewCount: true,
          stock: true,
          sku: true,
          weight: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      })
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(product)
    }
    
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000')
    const sort = searchParams.get('sort') || 'featured'
    const featured = searchParams.get('featured') === 'true'

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && {
        category: { slug: category },
      }),
      discountPrice: {
        gte: minPrice,
        lte: maxPrice,
      },
      ...(featured && { isFeatured: true }),
    }

    // Build orderBy clause
    let orderBy: any = []
    switch (sort) {
      case 'price-low':
        orderBy = [{ discountPrice: 'asc' }]
        break
      case 'price-high':
        orderBy = [{ discountPrice: 'desc' }]
        break
      case 'rating':
        orderBy = [{ rating: 'desc' }]
        break
      case 'newest':
        orderBy = [{ createdAt: 'desc' }]
        break
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          discountPrice: true,
          discount: true,
          images: true,
          rating: true,
          reviewCount: true,
          stock: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
