import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// POST - Create new product
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
    const {
      name,
      description,
      price,
      discountPrice,
      discount,
      stock,
      sku,
      weight,
      categoryId,
      images,
      isFeatured,
    } = body

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-')

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price as string),
        discountPrice: discountPrice ? parseFloat(discountPrice as string) : parseFloat(price as string),
        discount: discount ? parseInt(discount as string) : 0,
        stock: parseInt(stock as string),
        sku,
        weight: weight ? parseFloat(weight as string) : null,
        categoryId,
        images: images || [],
        isFeatured: isFeatured || false,
        isActive: true,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(
      { success: true, data: product, message: 'Product created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // If slug or id is provided, return single product
    if (slug) {
      const product = await prisma.product.findFirst({
        where: { slug, isActive: true },
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

    if (id && id !== '') {
      const product = await prisma.product.findFirst({
        where: { id, isActive: true },
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
        categoryId: category,
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
