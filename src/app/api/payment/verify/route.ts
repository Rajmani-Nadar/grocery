import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

interface VerifyRequest {
  orderId: string
  paymentId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json()
    const { orderId, paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!orderId || !paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: paymentId },
          { orderId },
        ],
      },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'PAID' || payment.status === 'COMPLETED' || payment.status === 'CAPTURED') {
      return NextResponse.json({ success: true, message: 'Payment already verified' })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 })
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureCode: 'INVALID_SIGNATURE',
          failureMessage: 'Invalid Razorpay signature',
          lastEvent: 'verification.failed',
        },
      })

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'FAILED', orderStatus: 'PAYMENT_FAILED' },
      })

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerSessionId: razorpay_payment_id,
          razorpayPaymentId: razorpay_payment_id,
          paymentSignature: razorpay_signature,
          paidAt: new Date(),
          capturedAt: new Date(),
          lastEvent: 'payment.captured',
          metadata: {
            ...(payment.metadata as Record<string, unknown> | null),
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            verifiedAt: new Date().toISOString(),
          },
        },
      })

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
        },
      })
    })

    return NextResponse.json({ success: true, message: 'Payment verified successfully' })
  } catch (error) {
    console.error('Razorpay verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
