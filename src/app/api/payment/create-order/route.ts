import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRazorpayClient, RAZORPAY_CURRENCY } from '@/lib/razorpay'
import { Prisma } from '@prisma/client'
import type { PaymentMethod } from '@/types'
import { calculatePricing } from '@/lib/pricing'

interface CreateOrderRequest {
  shippingAddressId: string
  paymentMethod: PaymentMethod
  idempotencyKey: string
  items: Array<{ productId: string; quantity: number }>
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body: CreateOrderRequest = await request.json()
    const { shippingAddressId, paymentMethod, idempotencyKey, items, amount } = body

    if (!shippingAddressId || !paymentMethod || !idempotencyKey || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const address = await prisma.address.findUnique({ where: { id: shippingAddressId } })
    if (!address || address.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 })
    }

    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 })
    }

    const orderItems = [] as Array<{
      productId: string
      quantity: number
      price: number
      total: number
      name: string
    }>

    let subtotal = 0
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 })
      }

      if (item.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const price = product.discountPrice ?? product.price
      const total = price * item.quantity
      subtotal += total

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        total,
        name: product.name,
      })
    }

    const pricing = calculatePricing(subtotal)
    const shippingCharge = pricing.shipping
    const tax = pricing.tax
    const discount = 0
    const total = pricing.total

    if (Math.abs(parsedAmount - total) > 0.01) {
      return NextResponse.json({ error: 'Order amount mismatch' }, { status: 400 })
    }

    const orderNumberHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          userId: user.id,
          shippingAddressId,
          paymentMethod,
          amount: total,
          items: items
            .map((item) => ({ productId: item.productId, quantity: item.quantity }))
            .sort((a, b) => a.productId.localeCompare(b.productId)),
        })
      )
      .digest('hex')

    const orderNumber = `ORD-${orderNumberHash.slice(0, 16).toUpperCase()}`

    let existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true },
    })

    if (!existingOrder) {
      try {
        existingOrder = await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNumber,
              userId: user.id,
              shippingAddressId,
              paymentMethod,
              paymentStatus: 'PENDING',
              orderStatus: 'PENDING',
              subtotal,
              shippingCharge,
              tax,
              discount,
              total,
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
              payment: true,
            },
          })

          const payment = await tx.payment.create({
            data: {
              orderId: order.id,
              provider: 'razorpay',
              providerReference: '',
              providerSessionId: '',
              paymentMethod,
              status: 'PENDING',
              amount: total,
              currency: RAZORPAY_CURRENCY,
              metadata: {
                idempotencyKey,
              },
            },
          })

          return { ...order, payment }
        })
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          existingOrder = await prisma.order.findUnique({
            where: { orderNumber },
            include: { payment: true },
          })
        } else {
          throw err
        }
      }
    }

    if (!existingOrder || !existingOrder.payment) {
      return NextResponse.json({ error: 'Failed to initialize order or payment' }, { status: 500 })
    }

    const amountInPaise = Math.round(total * 100)
    const razorpay = getRazorpayClient()

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: RAZORPAY_CURRENCY,
      receipt: orderNumber,
      notes: {
        orderId: existingOrder.id,
        paymentId: existingOrder.payment.id,
        userId: user.id,
      },
    })

    await prisma.payment.update({
      where: { id: existingOrder.payment.id },
      data: {
        providerReference: razorpayOrder.id,
        providerSessionId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        metadata: {
          ...(existingOrder.payment.metadata as Record<string, unknown> | null),
          razorpayOrderId: razorpayOrder.id,
          amountInPaise,
        },
      },
    })

    return NextResponse.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      orderId: existingOrder.id,
      paymentId: existingOrder.payment.id,
      customer: {
        name: user.name || session.user.name || 'Customer',
        email: user.email,
        phone: address.phone,
      },
    })
  } catch (error) {
    console.error('Create Razorpay order error:', error)
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
  }
}
