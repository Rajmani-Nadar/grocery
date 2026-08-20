'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store'
import Link from 'next/link'
import { AlertCircle, Banknote, CheckCircle, Home, Briefcase, Loader2, Mail, MapPin, Phone, WalletCards } from 'lucide-react'
import type { Address, PaymentMethod } from '@/types'
import toast from 'react-hot-toast'
import { loadRazorpayScript } from '@/lib/razorpay'

declare global {
  interface RazorpayInstance {
    on(event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void): void
    open(): void
  }

  interface RazorpayConstructor {
    new (options: Record<string, unknown>): RazorpayInstance
  }

  interface Window {
    Razorpay: RazorpayConstructor
  }
}

export default function CheckoutPage() {
  type CheckoutPaymentChoice = 'ONLINE' | 'CASH_ON_DELIVERY'
  const { data: session } = useSession()
  const router = useRouter()
  const { items: cartItems, getTotal, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [profileContact, setProfileContact] = useState({ name: '', phone: '', email: '' })
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentChoice | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const savedPaymentMethod = sessionStorage.getItem('grocery-checkout-payment-method')
    if (savedPaymentMethod === 'CASH_ON_DELIVERY') {
      setPaymentMethod('CASH_ON_DELIVERY')
    } else if (savedPaymentMethod) {
      setPaymentMethod('ONLINE')
    }
  }, [mounted])

  useEffect(() => {
    if (mounted) {
      if (paymentMethod) {
        sessionStorage.setItem('grocery-checkout-payment-method', paymentMethod)
      }
    }
  }, [mounted, paymentMethod])

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, router])

  useEffect(() => {
    if (mounted && session?.user?.email) {
      fetchAddresses()
    }
  }, [mounted, session])

  useEffect(() => {
    if (!mounted) {
      return
    }

    let key = sessionStorage.getItem('grocery-checkout-idempotency-key')
    if (!key) {
      key = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem('grocery-checkout-idempotency-key', key)
    }

    setIdempotencyKey(key)
  }, [mounted])

  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/profile')
      if (!response.ok) throw new Error('Failed to fetch addresses')
      const data = await response.json()
      setProfileContact({
        name: data.name || session?.user?.name || 'Customer',
        phone: data.phone || '',
        email: data.email || session?.user?.email || '',
      })
      const nextAddresses = (data.addresses || []) as Address[]
      setAddresses(nextAddresses)

      const newestAddress = [...nextAddresses].sort((first, second) => {
        const firstTime = new Date((first as Address & { createdAt?: string }).createdAt || 0).getTime()
        const secondTime = new Date((second as Address & { createdAt?: string }).createdAt || 0).getTime()
        return secondTime - firstTime
      })[0]
      if (newestAddress) setSelectedAddressId(newestAddress.id)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      toast.error('Failed to load addresses')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address')
      return
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method.')
      return
    }

    try {
      setIsSubmitting(true)

      const onlinePaymentMethod: PaymentMethod = 'UPI'

      if (paymentMethod === 'CASH_ON_DELIVERY') {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddressId: selectedAddressId,
            paymentMethod: 'CASH_ON_DELIVERY',
            items: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product?.discountPrice || item.product?.price || 0,
            })),
          }),
        })
        const data = await response.json()
        if (!response.ok || !data.orderId) {
          throw new Error(data.error || 'Failed to place COD order')
        }
        clearCart()
        toast.success('Order placed successfully')
        router.push(`/order-success/${data.orderId}`)
        return
      }

      await loadRazorpayScript()

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          paymentMethod: onlinePaymentMethod,
          idempotencyKey,
          amount: Number(getTotal().toFixed(2)),
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.order_id) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      const selectedAddress = addresses.find((address) => address.id === selectedAddressId)
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Grocery Store',
        description: `Order ${data.orderId}`,
        order_id: data.order_id,
        prefill: {
          name: data.customer?.name || session?.user?.name || 'Customer',
          email: data.customer?.email || session?.user?.email || '',
          contact: data.customer?.phone || profileContact.phone || '',
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
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
            clearCart()
            toast.success('Payment successful')
            router.push(`/order-success/${data.orderId}`)
          } catch (error) {
            console.error('Payment verification failed:', error)
            toast.error(error instanceof Error ? error.message : 'Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (paymentFailure: { error?: { description?: string } }) => {
        toast.error(paymentFailure.error?.description || 'Payment failed')
      })
      razorpay.open()
    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'HOME':
        return <Home className="w-4 h-4" />
      case 'WORK':
        return <Briefcase className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  if (!mounted) {
    return null
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen py-12">
        <div className="container-custom max-w-2xl text-center">
          <h1 className="text-h2 mb-4">Checkout</h1>
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-12 bg-slate-50 dark:bg-slate-950">
      <div className="container-custom max-w-4xl">
        <h1 className="text-h2 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
              <h2 className="font-bold text-lg mb-6">Shipping Address</h2>
              <div className="mb-5 rounded-lg border border-border bg-slate-50 p-4 dark:bg-slate-800">
                <p className="mb-2 text-sm font-semibold">Delivery To</p>
                <p className="font-medium">{profileContact.name || session?.user?.name || 'Customer'}</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {profileContact.phone && <p className="flex items-center gap-2"><Phone size={14} />{profileContact.phone}</p>}
                  {profileContact.email && <p className="flex items-center gap-2"><Mail size={14} />{profileContact.email}</p>}
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">No addresses found</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">Please add an address to proceed with checkout</p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedAddressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getAddressTypeIcon(address.type)}
                        <p className="font-semibold">{address.fullName}</p>
                        {address.isDefault && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {addresses.length === 0 && (
                <Button
                  className="w-full mt-4"
                  onClick={() => router.push('/profile?returnTo=%2Fcheckout&openAddress=true')}
                >
                  Add Address
                </Button>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-border rounded-lg">
              <h2 className="font-bold text-lg mb-6">Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                {([
                  {
                    value: 'ONLINE' as const,
                    title: 'UPI & Online Payment',
                    subtitle: 'Google Pay • PhonePe • BHIM • Credit/Debit Cards • Wallets • Net Banking',
                    caption: 'Secured by Razorpay',
                    icon: <WalletCards className="h-6 w-6" aria-hidden="true" />,
                  },
                  {
                    value: 'CASH_ON_DELIVERY' as const,
                    title: 'Cash On Delivery',
                    subtitle: 'Pay when your order is delivered.',
                    caption: '',
                    icon: <Banknote className="h-6 w-6" aria-hidden="true" />,
                  },
                ]).map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition ${
                      paymentMethod === method.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="mt-1 h-5 w-5 accent-primary"
                    />
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${paymentMethod === method.value ? 'bg-primary text-white' : 'bg-slate-100 text-primary dark:bg-slate-800'}`}>
                      {method.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{method.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{method.subtitle}</span>
                      {method.caption && <span className="mt-2 block text-xs font-medium text-primary">{method.caption}</span>}
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'CASH_ON_DELIVERY' && <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" /><p className="text-sm text-blue-900 dark:text-blue-100">Pay with cash when your order is delivered.</p></div>}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="h-fit p-6 bg-white dark:bg-slate-900 border border-border rounded-lg sticky top-6">
            <h2 className="font-bold text-lg mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product?.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹
                    {(
                      (item.product?.discountPrice || item.product?.price || 0) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹0.00</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !selectedAddressId || addresses.length === 0}
              aria-label="Place order"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your payment information is secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
