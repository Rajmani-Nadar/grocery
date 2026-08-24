import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const allowedTransitions: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user owns this order (or is admin)
    if (order.userId !== user.id && (user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { orderStatus, paymentStatus, notes } = body

    if (orderStatus) {
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        select: { orderStatus: true },
      })

      if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const allowedStatuses = allowedTransitions[existingOrder.orderStatus] || []
      if (existingOrder.orderStatus !== orderStatus && !allowedStatuses.includes(orderStatus)) {
        return NextResponse.json(
          {
            error: `Cannot change order status from ${existingOrder.orderStatus.replace(/_/g, ' ')} to ${String(orderStatus).replace(/_/g, ' ')}.`,
          },
          { status: 400 }
        )
      }
    }

    if (orderStatus === 'CANCELLED') {
      try {
        const cancelledOrder = await prisma.$transaction(async (tx) => {
          const existingOrder = await tx.order.findUnique({
            where: { id },
            include: { items: true },
          })

          if (!existingOrder) {
            throw new Error('ORDER_NOT_FOUND')
          }

          const cancellation = await tx.order.updateMany({
            where: {
              id,
              orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
            },
            data: { orderStatus: 'CANCELLED' },
          })

          if (cancellation.count !== 1) {
            throw new Error('CANCELLATION_NOT_ALLOWED')
          }

          for (const item of existingOrder.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          }

          return tx.order.findUniqueOrThrow({
            where: { id },
            include: {
              items: { include: { product: true } },
              shippingAddress: true,
              user: true,
            },
          })
        })

        return NextResponse.json(cancelledOrder)
      } catch (error) {
        if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }
        if (error instanceof Error && error.message === 'CANCELLATION_NOT_ALLOWED') {
          return NextResponse.json(
            { error: 'Only pending, confirmed, or processing orders can be cancelled.' },
            { status: 400 }
          )
        }
        throw error
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        user: true,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
