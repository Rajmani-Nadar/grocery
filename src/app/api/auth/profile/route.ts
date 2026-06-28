import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      addresses: user.addresses,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, phone, currentPassword, newPassword } = await request.json()

    const updateData: any = {
      name: name || undefined,
      phone: phone || undefined,
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password and new password are required' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (!user || !user.password) {
        return NextResponse.json(
          { success: false, error: 'User password not available' },
          { status: 400 }
        )
      }

      const isPasswordValid = await import('bcryptjs').then((bcrypt) => bcrypt.compare(currentPassword, user.password!))
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      const passwordHash = await import('bcryptjs').then((bcrypt) => bcrypt.hash(newPassword, 10))
      updateData.password = passwordHash
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    })

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      addresses: user.addresses,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
