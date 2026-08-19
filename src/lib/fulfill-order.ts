import { prisma } from '@/lib/prisma'

interface FulfillOrderInput {
  orderId: string
  paymentId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature?: string
  eventType: 'payment.captured' | 'payment.authorized'
}

export async function fulfillOrder(input: FulfillOrderInput) {
  const shouldDeductStock = input.eventType === 'payment.captured'

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: input.paymentId },
      include: { order: { include: { items: true } } },
    })

    if (!payment || payment.orderId !== input.orderId) {
      throw new Error('Payment not found')
    }

    if (payment.razorpayOrderId !== input.razorpayOrderId) {
      throw new Error('Invalid Razorpay order')
    }

    if (payment.status === 'PAID' && payment.lastEvent === 'payment.captured') {
      return { alreadyFulfilled: true }
    }

    const claimedPayment = await tx.payment.updateMany({
      where: {
        id: payment.id,
        orderId: input.orderId,
        ...(shouldDeductStock
          ? { OR: [{ status: { in: ['PENDING', 'FAILED', 'AUTHORIZED'] } }, { status: 'PAID', lastEvent: 'payment.authorized' }] }
          : { status: { in: ['PENDING', 'FAILED'] } }),
      },
      data: {
        status: shouldDeductStock ? 'PAID' : 'AUTHORIZED',
        providerSessionId: input.razorpayPaymentId,
        razorpayPaymentId: input.razorpayPaymentId,
        ...(input.razorpaySignature ? { paymentSignature: input.razorpaySignature } : {}),
        paidAt: shouldDeductStock ? payment.paidAt || new Date() : payment.paidAt,
        capturedAt: shouldDeductStock ? new Date() : payment.capturedAt,
        lastEvent: input.eventType,
        metadata: {
          ...(payment.metadata as Record<string, unknown> | null),
          razorpayPaymentId: input.razorpayPaymentId,
          razorpayOrderId: input.razorpayOrderId,
          lastPaymentEvent: input.eventType,
        },
      },
    })

    if (claimedPayment.count !== 1) {
      return { alreadyFulfilled: true }
    }

    if (shouldDeductStock) {
      const quantities = new Map<string, number>()
      for (const item of payment.order.items) {
        quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity)
      }

      for (const [productId, quantity] of quantities) {
        const updatedProduct = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        })

        if (updatedProduct.count !== 1) {
          throw new Error('Insufficient stock to fulfill order')
        }
      }
    }

    if (shouldDeductStock) {
      await tx.order.update({
        where: { id: input.orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
        },
      })
    }

    return { alreadyFulfilled: false }
  })
}