'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AuthModalProps {
  open: boolean
  message: string
  onClose: () => void
  onAuthenticated: (email: string, password: string) => Promise<void>
}

export function AuthModal({ open, message, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, input, a')
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name || password.length < 8 || password !== confirmPassword) {
          throw new Error('Enter your name and matching passwords of at least 8 characters.')
        }
        await axios.post('/api/auth/register', { name, email, password })
      }
      await onAuthenticated(email, password)
    } catch (caught) {
      setError(axios.isAxiosError(caught) ? caught.response?.data?.error || 'Registration failed' : caught instanceof Error ? caught.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="w-full max-w-md rounded-2xl border border-white/30 bg-white p-6 shadow-2xl outline-none dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-600">Grocery</p>
            <h2 id="auth-modal-title" className="mt-1 text-2xl font-bold">Sign in to continue</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </div>
          <button type="button" aria-label="Close authentication dialog" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['login', 'register'] as const).map((tab) => <button key={tab} type="button" onClick={() => { setMode(tab); setError('') }} className={`rounded-md py-2 text-sm font-medium ${mode === tab ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700' : 'text-muted-foreground'}`}>{tab === 'login' ? 'Login' : 'Register'}</button>)}
        </div>

        {error && <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === 'register' && <div className="relative"><User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Full name" className="pl-10" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required /></div>}
          <div className="relative"><Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Email address" type="email" className="pl-10" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
          <div className="relative"><Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Password" type={showPassword ? 'text' : 'password'} className="pl-10 pr-10" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {mode === 'register' && <Input aria-label="Confirm password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" required />}
          {mode === 'login' && <div className="flex justify-end"><a href="/auth/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</a></div>}
          <Button type="submit" className="w-full" isLoading={loading}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Button>
        </form>
      </div>
    </div>
  )
}