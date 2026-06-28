import nodemailer from 'nodemailer'

// Create transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // Add headers to improve deliverability
    tls: {
      rejectUnauthorized: false,
    },
  })
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Gmail credentials not configured. Email not sent.')
      console.log(`Email would have been sent to: ${to}`)
      return false
    }

    console.log(`[EMAIL] Attempting to send email to: ${to}`)
    console.log(`[EMAIL] Using Gmail account: ${process.env.GMAIL_EMAIL}`)

    const transporter = createTransporter()

    // Verify connection
    await transporter.verify()
    console.log('[EMAIL] SMTP connection verified successfully')

    const result = await transporter.sendMail({
      from: {
        name: 'Grocery Support',
        address: process.env.GMAIL_EMAIL,
      },
      to,
      subject,
      html,
      // Add headers to improve spam score
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Mailer': 'Grocery E-Commerce',
        'List-Unsubscribe': `<mailto:support@grocery.com?subject=unsubscribe>`,
      },
    })

    console.log(`[EMAIL] Email sent successfully to ${to}`)
    console.log(`[EMAIL] Message ID: ${result.messageId}`)
    return true
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error)
    if (error instanceof Error) {
      console.error('[EMAIL] Error message:', error.message)
      console.error('[EMAIL] Error code:', (error as any).code)
    }
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
        </div>

        <!-- Content -->
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="margin-top: 0;">Hi,</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666; background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px;">
            <code>${resetUrl}</code>
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; margin: 10px 0;">⏰ This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 12px; margin: 10px 0;">🔒 If you didn't request this, please ignore this email and contact support if needed.</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 5px 0;">© 2026 Grocery Inc. All rights reserved.</p>
          <p style="margin: 5px 0;">
            <a href="mailto:support@grocery.com" style="color: #22c55e; text-decoration: none;">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Grocery',
    html,
  })
}

export async function sendWelcomeEmail(name: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Grocery!</h1>
          <p style="color: #e0f5e0; margin: 10px 0 0 0;">Fresh Groceries at Your Doorstep</p>
        </div>

        <!-- Content -->
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for joining Grocery! We're thrilled to have you as part of our community. Get ready for fresh groceries delivered straight to your doorstep.</p>

          <h2 style="color: #22c55e; margin-top: 30px; font-size: 18px;">✨ What's Next?</h2>
          <ul style="color: #666; line-height: 2;">
            <li>🛒 <strong>Browse our selection</strong> - Fresh fruits, vegetables, dairy & more</li>
            <li>📦 <strong>Fast delivery</strong> - Get your groceries within 24 hours</li>
            <li>💳 <strong>Secure checkout</strong> - Multiple payment options</li>
            <li>📱 <strong>Track orders</strong> - Real-time order updates</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}" style="background-color: #22c55e; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Start Shopping Now
            </a>
          </div>

          <div style="background: white; padding: 20px; border-radius: 5px; border: 2px solid #22c55e; margin: 20px 0;">
            <p style="margin: 0; text-align: center;">
              <span style="color: #22c55e; font-size: 20px; font-weight: bold;">🎁 Special Welcome Offer</span>
            </p>
            <p style="margin: 10px 0 0 0; text-align: center; color: #666;">
              Enjoy <strong style="font-size: 18px; color: #22c55e;">10% OFF</strong> on your first order!
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <h3 style="color: #333; margin-top: 20px; font-size: 14px;">Need Help?</h3>
          <p style="color: #666; font-size: 14px;">
            Our support team is here to help. Contact us at 
            <a href="mailto:support@grocery.com" style="color: #22c55e; text-decoration: none;">support@grocery.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-radius: 0 0 8px 8px; background: #f3f4f6; border: 1px solid #e5e7eb;">
          <p style="margin: 5px 0;">© 2026 Grocery Inc. All rights reserved.</p>
          <p style="margin: 5px 0;">
            <a href="https://grocery.com/privacy" style="color: #22c55e; text-decoration: none; margin-right: 10px;">Privacy Policy</a>
            <a href="https://grocery.com/terms" style="color: #22c55e; text-decoration: none;">Terms of Service</a>
          </p>
          <p style="margin: 5px 0; color: #bbb;">This is a transactional email. You cannot unsubscribe from these emails.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to Grocery! 🛒 Your Fresh Groceries Await',
    html,
  })
}
