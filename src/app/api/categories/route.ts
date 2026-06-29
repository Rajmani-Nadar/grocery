import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        icon: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const name = body?.name?.toString().trim()
    const receivedSlug = body?.slug?.toString().trim()
    const slug = receivedSlug || slugify(name || '')

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    })

    if (existingCategory) {
      return NextResponse.json({ success: false, error: 'A category with that name or slug already exists' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: body?.description?.toString().trim() || null,
        image: body?.image?.toString().trim() || null,
        icon: body?.icon?.toString().trim() || null,
        isActive: body?.isActive !== false,
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const id = body?.id?.toString().trim()
    const name = body?.name?.toString().trim()
    const receivedSlug = body?.slug?.toString().trim()
    const slug = receivedSlug || slugify(name || '')

    if (!id || !name || !slug) {
      return NextResponse.json({ success: false, error: 'Category id, name and slug are required' }, { status: 400 })
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    })

    if (existingCategory && existingCategory.id !== id) {
      return NextResponse.json({ success: false, error: 'A category with that name or slug already exists' }, { status: 409 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: body?.description?.toString().trim() || null,
        image: body?.image?.toString().trim() || null,
        icon: body?.icon?.toString().trim() || null,
        isActive: body?.isActive !== false,
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category id is required' }, { status: 400 })
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } })

    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: 'This category is currently assigned to products. Remove or reassign those products first.' },
        { status: 409 }
      )
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
  }
}
