import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.fullName || !data.phone || !data.addressLine1 || !data.city || !data.state || !data.postalCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || session.user.email,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
        type: data.type || 'HOME',
        isDefault: data.isDefault || false,
      },
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create address' },
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

    const data = await request.json()
    const { id } = data

    // Verify the address belongs to the user
    const userAddress = await prisma.address.findFirst({
      where: {
        id,
        user: { email: session.user.email },
      },
    })

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName: data.fullName || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        addressLine1: data.addressLine1 || undefined,
        addressLine2: data.addressLine2 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        country: data.country || undefined,
        type: data.type || undefined,
        isDefault: data.isDefault !== undefined ? data.isDefault : undefined,
      },
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id } = data

    // Verify the address belongs to the user
    const userAddress = await prisma.address.findFirst({
      where: {
        id,
        user: { email: session.user.email },
      },
    })

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
