import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRazorpayClient, RAZORPAY_CURRENCY } from '@/lib/razorpay'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { id: orderId } = await params
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, shippingAddress: true },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (
      !order.payment ||
      order.paymentStatus !== 'PENDING' ||
      order.orderStatus !== 'PENDING' ||
      order.paymentMethod === 'CASH_ON_DELIVERY'
    ) {
      return NextResponse.json({ error: 'This order is not eligible for payment retry' }, { status: 409 })
    }

    if (order.payment.status === 'AUTHORIZED' && order.payment.razorpayOrderId) {
      return NextResponse.json({
        order_id: order.payment.razorpayOrderId,
        amount: Math.round(order.total * 100),
        currency: RAZORPAY_CURRENCY,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        orderId: order.id,
        paymentId: order.payment.id,
        customer: {
          name: user.name || session.user.name || 'Customer',
          email: user.email,
          phone: order.shippingAddress?.phone || '',
        },
      })
    }

    const claimedPayment = await prisma.payment.updateMany({
      where: {
        id: order.payment.id,
        status: { in: ['PENDING', 'FAILED'] },
      },
      data: {
        status: 'AUTHORIZED',
        attemptCount: { increment: 1 },
        failureCode: null,
        failureMessage: null,
        errorMessage: null,
        lastEvent: 'payment.retry.started',
      },
    })

    if (claimedPayment.count !== 1) {
      return NextResponse.json({ error: 'A payment attempt is already in progress' }, { status: 409 })
    }

    const amountInPaise = Math.round(order.total * 100)
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: 'PENDING', lastEvent: 'payment.retry.failed' },
      })
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 })
    }

    try {
      const razorpayOrder = await getRazorpayClient().orders.create({
        amount: amountInPaise,
        currency: RAZORPAY_CURRENCY,
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
          paymentId: order.payment.id,
          userId: user.id,
          attemptCount: String(order.payment.attemptCount + 1),
        },
      })

      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          providerReference: razorpayOrder.id,
          providerSessionId: razorpayOrder.id,
          razorpayOrderId: razorpayOrder.id,
          lastEvent: 'payment.retry.created',
          metadata: {
            ...(order.payment.metadata as Record<string, unknown> | null),
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
        orderId: order.id,
        paymentId: order.payment.id,
        customer: {
          name: user.name || session.user.name || 'Customer',
          email: user.email,
          phone: order.shippingAddress?.phone || '',
        },
      })
    } catch (error) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: 'PENDING',
          failureCode: 'RAZORPAY_ORDER_CREATE_FAILED',
          failureMessage: 'Unable to create a Razorpay payment order',
          lastEvent: 'payment.retry.failed',
        },
      })
      throw error
    }
  } catch (error) {
    console.error('Retry payment error:', error)
    return NextResponse.json({ error: 'Failed to prepare payment retry' }, { status: 500 })
  }
}