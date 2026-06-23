import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * pageSize

    // Fetch reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.review.count({ where: { productId } }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    // Calculate average rating
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })
    const averageRating = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map(r => ({
          ...r,
          authorName: r.user.name,
          authorEmail: r.user.email,
          user: undefined, // Remove user object
        })),
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
        },
        averageRating: Math.round(averageRating * 10) / 10,
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login to add a review.' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { productId, rating, comment } = body

    // Validate required fields
    if (!productId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Product ID and rating are required' },
        { status: 400 }
      )
    }

    // Validate rating is between 1-5
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user has purchased this product (optional but good practice)
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
        },
      },
    })

    // For now, we'll allow anyone to review (remove this check if you want)
    // If you want to require purchase, uncomment below:
    // if (!purchase) {
    //   return NextResponse.json(
    //     { success: false, error: 'You can only review products you have purchased' },
    //     { status: 403 }
    //   )
    // }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: user.id,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: updatedReview,
          message: 'Review updated successfully',
        },
        { status: 200 }
      )
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Review created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
