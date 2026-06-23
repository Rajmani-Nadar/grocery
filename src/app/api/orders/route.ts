import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { PaymentMethod } from '@/types'

interface OrderItemInput {
  productId: string
  quantity: number
  price: number
}

interface CreateOrderRequest {
  shippingAddressId: string
  paymentMethod: PaymentMethod
  items: OrderItemInput[]
}

export async function POST(request: NextRequest) {
  try {
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

    const body: CreateOrderRequest = await request.json()
    const { shippingAddressId, paymentMethod, items } = body

    // Validate required fields
    if (!shippingAddressId || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: shippingAddressId },
    })

    if (!address || address.userId !== user.id) {
      return NextResponse.json(
        { error: 'Invalid shipping address' },
        { status: 400 }
      )
    }

    // Verify all products exist and calculate totals
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
      },
    })

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: 'Some products not found' },
        { status: 400 }
      )
    }

    // Calculate order totals
    let subtotal = 0
    const orderItems: Array<{
      productId: string
      quantity: number
      price: number
      total: number
    }> = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 400 }
        )
      }

      // Verify stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const price = item.price
      const total = price * item.quantity
      subtotal += total

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        total,
      })
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        shippingAddressId,
        paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: 'CONFIRMED',
        subtotal,
        shippingCharge: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: 0,
            total: item.total,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        shippingAddress: true,
      },
    })

    // Update product stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Clear user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
