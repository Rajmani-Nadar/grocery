import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_CURRENCY, getOrigin } from '@/lib/stripe'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'
import type { PaymentMethod } from '@/types'

interface CreateSessionRequest {
  shippingAddressId: string
  paymentMethod: PaymentMethod
  idempotencyKey: string
  items: Array<{ productId: string; quantity: number }>
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

    const body: CreateSessionRequest = await request.json()
    const { shippingAddressId, paymentMethod, idempotencyKey, items } = body

    if (!shippingAddressId || !paymentMethod || !idempotencyKey || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const shippingCharge = 0
    const tax = 0
    const discount = 0
    const total = subtotal + shippingCharge + tax - discount

    const orderNumberHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          userId: user.id,
          shippingAddressId,
          paymentMethod,
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
              provider: 'stripe',
              providerReference: '',
              paymentMethod,
              status: 'PENDING',
              amount: total,
              currency: STRIPE_CURRENCY.toUpperCase(),
            },
          })

          return { ...order, payment }
        })
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
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

    const origin = getOrigin(request.url)
    const successUrl = `${origin}/order-success/${existingOrder.id}`
    const cancelUrl = `${origin}/checkout`

    let sessionData
    if (existingOrder.payment.providerReference?.startsWith('cs_')) {
      sessionData = await stripe.checkout.sessions.retrieve(existingOrder.payment.providerReference)
      if (!sessionData.url) {
        sessionData = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          customer_email: user.email ?? undefined,
          line_items: orderItems.map((item) => ({
            price_data: {
              currency: STRIPE_CURRENCY,
              product_data: {
                name: item.name,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          metadata: {
            orderId: existingOrder.id,
            paymentId: existingOrder.payment.id,
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        })

        await prisma.payment.update({
          where: { id: existingOrder.payment.id },
          data: { providerReference: sessionData.id },
        })
      }
    } else {
      sessionData = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email ?? undefined,
        payment_intent_data: {
          metadata: {
            orderId: existingOrder.id,
            paymentId: existingOrder.payment.id,
          },
        },
        line_items: orderItems.map((item) => ({
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        metadata: {
          orderId: existingOrder.id,
          paymentId: existingOrder.payment.id,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      const providerSessionId =
        typeof sessionData.payment_intent === 'string'
          ? sessionData.payment_intent
          : sessionData.payment_intent?.id ?? null

      await prisma.payment.update({
        where: { id: existingOrder.payment.id },
        data: {
          providerReference: sessionData.id,
          providerSessionId: providerSessionId || undefined,
        },
      })
    }

    return NextResponse.json({
      sessionId: sessionData.id,
      checkoutUrl: sessionData.url,
      orderId: existingOrder.id,
    })
  } catch (error) {
    console.error('Create Stripe session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
