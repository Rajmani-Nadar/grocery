import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface FailureRequest {
  orderId: string
  paymentId: string
  errorCode?: string
  errorDescription?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const body = (await request.json()) as FailureRequest
    if (!user || !body.orderId || !body.paymentId) {
      return NextResponse.json({ error: 'Invalid payment failure request' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: { id: body.paymentId, orderId: body.orderId },
      include: { order: true },
    })
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    if (payment.order.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (payment.status === 'PAID') return NextResponse.json({ success: true })

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PENDING',
          failureCode: body.errorCode || 'PAYMENT_FAILED',
          failureMessage: body.errorDescription || 'Payment failed',
          lastEvent: 'payment.failed',
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PENDING', orderStatus: 'PENDING' },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment failure update error:', error)
    return NextResponse.json({ error: 'Failed to record payment failure' }, { status: 500 })
  }
}