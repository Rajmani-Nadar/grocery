import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Avoid user enumeration
      return NextResponse.json({ success: true })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = await hash(resetToken, 10)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        tokenHash,
        expiresAt,
      },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    // Send password reset email
    try {
      console.log(`[FORGOT-PASSWORD] Sending reset email to ${email}`)
      await sendPasswordResetEmail(email, resetUrl)
      console.log(`[FORGOT-PASSWORD] Email sent successfully`)
    } catch (emailError) {
      console.error('[FORGOT-PASSWORD] Failed to send reset email:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process password reset' }, { status: 500 })
  }
}
