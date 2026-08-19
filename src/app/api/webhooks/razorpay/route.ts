import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { fulfillOrder } from '@/lib/fulfill-order'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const eventType = event.event
    const paymentEntity = event.payload?.payment?.entity

    if (!paymentEntity) {
      return NextResponse.json({ received: true })
    }

    const paymentId = paymentEntity.notes?.paymentId
    const orderId = paymentEntity.notes?.orderId

    if (!paymentId || !orderId) {
      return NextResponse.json({ received: true })
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) {
      return NextResponse.json({ received: true })
    }

    if (
      payment.status === 'PAID' &&
      payment.lastEvent === 'payment.captured' &&
      (eventType === 'payment.captured' || eventType === 'payment.authorized')
    ) {
      return NextResponse.json({ received: true })
    }

    if (eventType === 'payment.captured' || eventType === 'payment.authorized') {
      await fulfillOrder({
        orderId,
        paymentId,
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        eventType,
      })
    }

    if (eventType === 'payment.failed') {
      if (payment.status === 'PAID' || payment.status === 'COMPLETED' || payment.status === 'CAPTURED') {
        return NextResponse.json({ received: true })
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failureCode: paymentEntity.error_code || 'PAYMENT_FAILED',
            failureMessage: paymentEntity.error_description || 'Payment failed',
            lastEvent: eventType,
          },
        })

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PENDING',
            orderStatus: 'PENDING',
          },
        })
      })
    }

    if (eventType === 'refund.processed') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          lastEvent: eventType,
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
