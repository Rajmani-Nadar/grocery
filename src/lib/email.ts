import nodemailer from 'nodemailer'

const getRequiredEmailConfig = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_EMAIL
  const password = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD
  const host = process.env.SMTP_HOST || (user?.endsWith('@gmail.com') ? 'smtp.gmail.com' : '')
  const port = Number(process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? 587 : 0))
  const from = process.env.SMTP_FROM || user

  if (!host || !port || !user || !password || !from) {
    throw new Error('Email SMTP configuration is incomplete')
  }

  return { host, port, user, password, from }
}

const createTransporter = () => {
  const config = getRequiredEmailConfig()

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: process.env.SMTP_SECURE === 'true' || config.port === 465,
    auth: { user: config.user, pass: config.password },
    tls: { rejectUnauthorized: true },
  })
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character)

const getEmailIdentity = () => ({
  companyName: process.env.EMAIL_COMPANY_NAME || 'Grocery',
  companyEmail: process.env.EMAIL_CONTACT || process.env.SMTP_FROM || process.env.GMAIL_EMAIL || '',
  companyAddress: process.env.EMAIL_COMPANY_ADDRESS || '',
  baseUrl: (
    process.env.EMAIL_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://rajmani-grocery.vercel.app'
      : process.env.NEXTAUTH_URL || 'http://localhost:3000')
  ).replace(/\/$/, ''),
})

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions) {
  try {
    const config = getRequiredEmailConfig()
    const identity = getEmailIdentity()
    const transporter = createTransporter()
    const fromAddress = config.from.match(/<([^>]+)>/)?.[1] || config.from
    const messageDomain = fromAddress.split('@')[1] || 'localhost'

    await transporter.verify()

    const result = await transporter.sendMail({
      from: config.from.includes('<') ? config.from : { name: identity.companyName, address: config.from },
      to,
      subject,
      text,
      html,
      replyTo: replyTo || identity.companyEmail || fromAddress,
      envelope: { from: fromAddress, to },
      messageId: `<${crypto.randomUUID()}@${messageDomain}>`,
      headers: {
        'Auto-Submitted': 'auto-generated',
        'X-Mailer': 'Grocery transactional mail',
      },
    })

    console.log(`[EMAIL] Sent ${subject} to ${to}; Message-ID: ${result.messageId}`)
    return true
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const identity = getEmailIdentity()
  const safeUrl = escapeHtml(resetUrl)
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f7f5;color:#243024;font-family:Arial,sans-serif;line-height:1.6">
  <div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border:1px solid #dfe7df;padding:28px">
    <h1 style="margin:0 0 20px;color:#15803d;font-size:24px">Reset your ${escapeHtml(identity.companyName)} password</h1>
    <p>We received a request to reset your password.</p>
    <p><a href="${safeUrl}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 20px;text-decoration:none">Reset password</a></p>
    <p style="font-size:14px;color:#536153">If the button does not work, copy this address into your browser:</p>
    <p style="font-size:13px;word-break:break-all">${safeUrl}</p>
    <p style="font-size:14px;color:#536153">This link expires in one hour. If you did not request it, you can ignore this message.</p>
  </div><p style="font-size:12px;color:#697469;text-align:center">${escapeHtml(identity.companyName)}${identity.companyAddress ? ` · ${escapeHtml(identity.companyAddress)}` : ''}${identity.companyEmail ? ` · ${escapeHtml(identity.companyEmail)}` : ''}</p></div>
</body></html>`
  const text = `Reset your ${identity.companyName} password\n\nWe received a request to reset your password.\n\nReset password: ${resetUrl}\n\nThis link expires in one hour. If you did not request it, you can ignore this message.\n\n${identity.companyName}${identity.companyAddress ? ` · ${identity.companyAddress}` : ''}${identity.companyEmail ? ` · ${identity.companyEmail}` : ''}`

  return sendEmail({ to: email, subject: `Reset your ${identity.companyName} password`, html, text })
}

export async function sendWelcomeEmail(name: string, email: string) {
  const identity = getEmailIdentity()
  const safeName = escapeHtml(name)
  const homeUrl = escapeHtml(identity.baseUrl)
  const privacyUrl = `${homeUrl}/privacy`
  const termsUrl = `${homeUrl}/terms`
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f7f5;color:#243024;font-family:Arial,sans-serif;line-height:1.6">
  <div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fff;border:1px solid #dfe7df;padding:28px">
    <p style="margin:0 0 18px;color:#15803d;font-size:14px;font-weight:bold">${escapeHtml(identity.companyName)}</p>
    <h1 style="margin:0 0 20px;font-size:24px">Your account is ready</h1>
    <p>Hi ${safeName},</p>
    <p>Thanks for creating an account with ${escapeHtml(identity.companyName)}. You can now browse products, manage your cart, and track your orders.</p>
    <p><a href="${homeUrl}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 20px;text-decoration:none">Visit ${escapeHtml(identity.companyName)}</a></p>
    <p style="font-size:14px;color:#536153">You received this message because an account was created with this email address. For help, reply to this email${identity.companyEmail ? ` or contact ${escapeHtml(identity.companyEmail)}` : ''}.</p>
  </div><p style="font-size:12px;color:#697469;text-align:center">${escapeHtml(identity.companyName)}${identity.companyAddress ? ` · ${escapeHtml(identity.companyAddress)}` : ''}</p>
  <p style="font-size:12px;text-align:center"><a href="${privacyUrl}">Privacy</a> · <a href="${termsUrl}">Terms</a></p></div>
</body></html>`
  const text = `Your ${identity.companyName} account is ready\n\nHi ${name},\n\nThanks for creating an account with ${identity.companyName}. You can now browse products, manage your cart, and track your orders.\n\nVisit ${identity.companyName}: ${identity.baseUrl}\n\nYou received this message because an account was created with this email address. For help, reply to this email${identity.companyEmail ? ` or contact ${identity.companyEmail}` : ''}.\n\n${identity.companyName}${identity.companyAddress ? ` · ${identity.companyAddress}` : ''}`

  return sendEmail({ to: email, subject: `Your ${identity.companyName} account is ready`, html, text })
}
