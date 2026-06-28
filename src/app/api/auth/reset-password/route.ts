import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password are required' }, { status: 400 })
    }

    const resetRecords = await prisma.passwordReset.findMany({
      where: { expiresAt: { gt: new Date() } },
    })

    const matchingRecord = await Promise.all(
      resetRecords.map(async (record) => {
        const isMatch = await compare(token, record.tokenHash)
        return isMatch ? record : null
      })
    ).then((results) => results.find((item) => item !== null))

    if (!matchingRecord) {
      return NextResponse.json({ success: false, error: 'Reset token is invalid or expired' }, { status: 400 })
    }

    const passwordHash = await hash(password, 10)
    await prisma.user.update({
      where: { id: matchingRecord.userId },
      data: { password: passwordHash },
    })

    await prisma.passwordReset.delete({ where: { id: matchingRecord.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 })
  }
}
