'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Hand, KeyRound, Lock, Mail, MapPin, Phone, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Address {
  id: string
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  type: 'HOME' | 'WORK' | 'OTHER'
  isDefault: boolean
}

interface UserProfile {
  name: string
  email: string
  phone: string
  addresses: Address[]
}

function ProfileContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const addressSectionRef = useRef<HTMLDivElement>(null)
  const firstAddressInputRef = useRef<HTMLInputElement>(null)
  const shouldOpenAddress = searchParams.get('openAddress') === 'true'
  const returnTo = searchParams.get('returnTo')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState<Partial<Address>>({})
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)

  useEffect(() => {
    if (!session?.user?.email) {
      router.push('/auth/login')
      return
    }

    fetchProfile()
  }, [session, router])

  useEffect(() => {
    if (!shouldOpenAddress || isLoading || !profile) return

    setEditingAddressId('new')
    setNewAddress({
      type: 'HOME',
      isDefault: profile.addresses.length === 0,
    })

    const focusTimer = window.setTimeout(() => {
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      firstAddressInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [shouldOpenAddress, isLoading, profile])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({
        ...profile,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    const isPasswordUpdate = Boolean(currentPassword || newPassword || confirmPassword)

    try {
      setIsSaving(true)
      const payload: any = {
        name: profile.name,
        phone: profile.phone,
      }

      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setMessage({ type: 'error', text: 'Fill all password fields to change password' })
          return
        }
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' })
          return
        }
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      if (isPasswordUpdate) {
        setIsPasswordFormOpen(false)
        toast.success('Password updated successfully.')
      }
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    })
  }

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.email || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    try {
      setIsSaving(true)
      const isNewAddress = editingAddressId === 'new'
      const response = await fetch('/api/auth/address', {
        method: isNewAddress ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isNewAddress ? {} : { id: editingAddressId }),
          ...newAddress,
        }),
      })

      if (!response.ok) throw new Error('Failed to save address')

      await fetchProfile()
      setEditingAddressId(null)
      setNewAddress({})
      if (returnTo) {
        toast.success('Address saved. Continue your checkout.')
        router.replace(returnTo)
        return
      }
      setMessage({ type: 'success', text: 'Address saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save address' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch('/api/auth/address', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addressId }),
      })

      if (!response.ok) throw new Error('Failed to delete address')
      await fetchProfile()
      setMessage({ type: 'success', text: 'Address deleted successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete address' })
    }
  }

  if (!session) {
    return null
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and addresses</p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </div>
        )}

        {/* Profile Information */}
        {profile && (
          <>
            <Card ref={addressSectionRef}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-100 dark:bg-slate-700"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+91-1234567890"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                  <Save size={18} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <motion.div
              animate={{ scale: isPasswordFormOpen ? 1.01 : 1 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Card className={`rounded-2xl bg-white shadow-sm transition-shadow dark:bg-slate-900 ${isPasswordFormOpen ? 'border-green-300 shadow-[0_8px_30px_rgba(34,197,94,0.14)] dark:border-green-800' : 'border-border'}`}>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password securely.</CardDescription>
                  </div>
                  <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                    {!isPasswordFormOpen && (
                      <motion.span
                        aria-hidden="true"
                        animate={{ y: [-2, 2, -2], rotate: [-4, 4, -4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-primary-600"
                      >
                        <Hand size={20} />
                      </motion.span>
                    )}
                    <button
                      type="button"
                      aria-expanded={isPasswordFormOpen}
                      aria-controls="change-password-form"
                      onClick={() => setIsPasswordFormOpen((open) => !open)}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto ${isPasswordFormOpen ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md' : 'border border-slate-200 bg-white text-slate-700 hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'}`}
                    >
                      {isPasswordFormOpen ? <Sparkles size={16} /> : <Lock size={16} />}
                      {isPasswordFormOpen ? 'Hide Password Form' : 'Change Password'}
                      {isPasswordFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </CardHeader>
                <AnimatePresence initial={false}>
                  {isPasswordFormOpen && (
                    <motion.div
                      id="change-password-form"
                      initial={{ height: 0, opacity: 0, y: -10 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Current Password</label>
                          <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current password"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">New Password</label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                          <KeyRound size={18} className="mr-2" />
                          {isSaving ? 'Updating Password...' : 'Update Password'}
                        </Button>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address List */}
                {profile.addresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {profile.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-border rounded-lg p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              {address.fullName}
                              {address.isDefault && (
                                <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Phone size={14} />
                              {address.phone}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin size={14} />
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingAddressId(address.id)
                                setNewAddress(address)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit Address Form */}
                {editingAddressId === null ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEditingAddressId('new')
                      setNewAddress({
                        type: 'HOME',
                        isDefault: profile.addresses.length === 0,
                      })
                    }}
                  >
                    + Add New Address
                  </Button>
                ) : (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-foreground">
                      {editingAddressId === 'new' ? 'Add New Address' : 'Edit Address'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name *</label>
                        <Input
                          ref={firstAddressInputRef}
                          type="text"
                          name="fullName"
                          value={newAddress.fullName || ''}
                          onChange={handleAddressChange}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone *</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={newAddress.phone || ''}
                          onChange={handleAddressChange}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        type="email"
                        name="email"
                        value={newAddress.email || ''}
                        onChange={handleAddressChange}
                        placeholder="Email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address Line 1 *</label>
                      <Input
                        type="text"
                        name="addressLine1"
                        value={newAddress.addressLine1 || ''}
                        onChange={handleAddressChange}
                        placeholder="Street address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address Line 2</label>
                      <Input
                        type="text"
                        name="addressLine2"
                        value={newAddress.addressLine2 || ''}
                        onChange={handleAddressChange}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City *</label>
                        <Input
                          type="text"
                          name="city"
                          value={newAddress.city || ''}
                          onChange={handleAddressChange}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State *</label>
                        <Input
                          type="text"
                          name="state"
                          value={newAddress.state || ''}
                          onChange={handleAddressChange}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Postal Code *</label>
                        <Input
                          type="text"
                          name="postalCode"
                          value={newAddress.postalCode || ''}
                          onChange={handleAddressChange}
                          placeholder="Postal code"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveAddress} disabled={isSaving} className="flex-1">
                        Save Address
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingAddressId(null)
                          setNewAddress({})
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  )
}
