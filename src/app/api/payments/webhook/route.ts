import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable')
}

export const config = {
  api: {
    bodyParser: false,
  },
}

async function streamToString(readable: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!readable) {
    return ''
  }

  const reader = readable.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
    }
  }

  const full = chunks.reduce((acc, chunk) => {
    const tmp = new Uint8Array(acc.length + chunk.length)
    tmp.set(acc, 0)
    tmp.set(chunk, acc.length)
    return tmp
  }, new Uint8Array())

  return new TextDecoder().decode(full)
}

export async function POST(request: NextRequest) {
  try {
    const payload = await streamToString(request.body)
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret as string)

    const handled = await handleEvent(event)
    if (!handled) {
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event)
      return true
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event)
      return true
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event)
      return true
    case 'payment_intent.canceled':
      await handlePaymentIntentCanceled(event)
      return true
    case 'charge.refunded':
      await handleChargeRefunded(event)
      return true
    default:
      return false
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata || {}

  if (!metadata.orderId || !metadata.paymentId) {
    throw new Error('Missing orderId or paymentId in Stripe session metadata')
  }

  const orderId = metadata.orderId
  const paymentId = metadata.paymentId

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.updateMany({
      where: {
        id: paymentId,
        status: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        status: 'CAPTURED',
        providerReference: session.id,
        providerSessionId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? undefined,
        paidAt: new Date(),
        capturedAt: new Date(),
        metadata: session.metadata ? session.metadata : undefined,
      },
    })

    if (paymentUpdate.count === 0) {
      return
    }

    await tx.order.updateMany({
      where: {
        id: orderId,
        paymentStatus: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        paymentStatus: 'CAPTURED',
        orderStatus: 'CONFIRMED',
      },
    })

    await tx.cartItem.deleteMany({
      where: {
        cart: {
          userId: order.userId,
        },
      },
    })

    await Promise.all(
      order.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      )
    )
  })
}

async function handleCheckoutSessionExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata || {}

  if (!metadata.orderId || !metadata.paymentId) {
    throw new Error('Missing orderId or paymentId in Stripe session metadata')
  }

  await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.updateMany({
      where: {
        id: metadata.paymentId,
        status: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        status: 'CANCELLED',
      },
    })

    if (paymentUpdate.count === 0) {
      return
    }

    await tx.order.updateMany({
      where: {
        id: metadata.orderId,
        paymentStatus: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        paymentStatus: 'CANCELLED',
      },
    })
  })
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const metadata = paymentIntent.metadata || {}

  if (!metadata.paymentId || !metadata.orderId) {
    throw new Error('Missing orderId or paymentId in PaymentIntent metadata')
  }

  await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.updateMany({
      where: {
        id: metadata.paymentId,
        status: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        status: 'FAILED',
      },
    })

    if (paymentUpdate.count === 0) {
      return
    }

    await tx.order.updateMany({
      where: {
        id: metadata.orderId,
        paymentStatus: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        paymentStatus: 'FAILED',
      },
    })
  })
}

async function handlePaymentIntentCanceled(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const metadata = paymentIntent.metadata || {}

  if (!metadata.paymentId || !metadata.orderId) {
    throw new Error('Missing orderId or paymentId in PaymentIntent metadata')
  }

  await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.updateMany({
      where: {
        id: metadata.paymentId,
        status: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        status: 'CANCELLED',
      },
    })

    if (paymentUpdate.count === 0) {
      return
    }

    await tx.order.updateMany({
      where: {
        id: metadata.orderId,
        paymentStatus: {
          in: ['PENDING', 'AUTHORIZED'],
        },
      },
      data: {
        paymentStatus: 'CANCELLED',
      },
    })
  })
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge
  const metadata = charge.metadata || {}

  if (!metadata.paymentId || !metadata.orderId) {
    throw new Error('Missing orderId or paymentId in Charge metadata')
  }

  await prisma.$transaction(async (tx) => {
    const paymentUpdate = await tx.payment.updateMany({
      where: {
        id: metadata.paymentId,
        status: {
          not: 'REFUNDED',
        },
      },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
      },
    })

    if (paymentUpdate.count === 0) {
      return
    }

    await tx.order.updateMany({
      where: {
        id: metadata.orderId,
        paymentStatus: {
          not: 'REFUNDED',
        },
      },
      data: {
        paymentStatus: 'REFUNDED',
      },
    })
  })
}
