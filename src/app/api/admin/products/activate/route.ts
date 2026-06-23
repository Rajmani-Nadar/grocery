import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Activate all products (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const result = await prisma.product.updateMany({
      where: { isActive: false },
      data: { isActive: true }
    })

    return NextResponse.json({
      success: true,
      message: `Activated ${result.count} products`,
      data: { activatedCount: result.count }
    })
  } catch (error) {
    console.error('Error activating products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to activate products' },
      { status: 500 }
    )
  }
}
