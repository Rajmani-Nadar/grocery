import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { fulfillOrder } from '@/lib/fulfill-order'

interface VerifyRequest {
  orderId: string
  paymentId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body: VerifyRequest = await request.json()
    const { orderId, paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!orderId || !paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        orderId,
      },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (payment.order.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (payment.status === 'PAID' && payment.lastEvent === 'payment.captured') {
      return NextResponse.json({ success: true, message: 'Payment already verified' })
    }
    if (payment.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: 'Invalid Razorpay order' }, { status: 400 })
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
          status: 'PENDING',
          failureCode: 'INVALID_SIGNATURE',
          failureMessage: 'Invalid Razorpay signature',
          lastEvent: 'verification.failed',
        },
      })

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PENDING', orderStatus: 'PENDING' },
      })

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    await fulfillOrder({
      orderId,
      paymentId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      eventType: 'payment.captured',
    })

    return NextResponse.json({ success: true, message: 'Payment verified successfully' })
  } catch (error) {
    console.error('Razorpay verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
