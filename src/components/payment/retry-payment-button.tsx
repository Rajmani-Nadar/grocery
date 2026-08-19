'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { loadRazorpayScript } from '@/lib/razorpay'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: RazorpayConstructor
  }
}

interface RetryPaymentButtonProps {
  orderId: string
  onSuccess?: () => void
}

export function RetryPaymentButton({ orderId, onSuccess }: RetryPaymentButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const recordFailure = async (paymentId: string, error?: { code?: string; description?: string }) => {
    await fetch('/api/payment/failure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        paymentId,
        errorCode: error?.code,
        errorDescription: error?.description,
      }),
    })
  }

  const handleRetry = async () => {
    try {
      setIsSubmitting(true)
      await loadRazorpayScript()
      const response = await fetch(`/api/orders/${orderId}/retry-payment`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok || !data.order_id || !data.key_id) throw new Error(data.error || 'Failed to prepare payment')

      const finish = () => {
        setIsSubmitting(false)
        if (onSuccess) onSuccess()
        else router.refresh()
      }

      const razorpay = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Grocery Store',
        description: `Order ${data.orderId}`,
        order_id: data.order_id,
        prefill: {
          name: data.customer?.name || 'Customer',
          email: data.customer?.email || '',
          contact: data.customer?.phone || '',
        },
        theme: { color: '#2563eb' },
        handler: async (paymentResponse: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                paymentId: data.paymentId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            })
            const verifyData = await verifyResponse.json()
            if (!verifyResponse.ok || !verifyData.success) throw new Error(verifyData.error || 'Payment verification failed')
            toast.success('Payment successful')
            finish()
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Payment verification failed')
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: async () => {
            await recordFailure(data.paymentId, {
              code: 'PAYMENT_CANCELLED',
              description: 'Payment cancelled by customer',
            })
            toast.error('Payment cancelled. You can retry the payment from your order.')
            setIsSubmitting(false)
          },
        },
      })

      razorpay.on('payment.failed', async (paymentFailure: { error?: { code?: string; description?: string } }) => {
        await recordFailure(data.paymentId, paymentFailure.error)
        toast.error(paymentFailure.error?.description || 'Payment failed. You can retry the payment.')
        setIsSubmitting(false)
      })
      razorpay.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to prepare payment')
      setIsSubmitting(false)
    }
  }

  return (
    <Button onClick={handleRetry} disabled={isSubmitting} variant="default" size="sm">
      {isSubmitting ? 'Preparing Payment...' : 'Retry Payment'}
    </Button>
  )
}