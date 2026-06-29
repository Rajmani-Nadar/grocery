import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
})

export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'INR').toLowerCase()

export function getOrigin(requestUrl: string) {
  return new URL(requestUrl).origin
}
