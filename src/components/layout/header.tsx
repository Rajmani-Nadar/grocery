'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart, useTheme } from '@/store'
import { Button } from '@/components/ui/button'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  LogIn,
  User,
} from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const { items: cartItems, getItemCount } = useCart()
  const { isDark, toggleDarkMode } = useTheme()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
      <div className="container-custom py-3">
        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center justify-between mb-3">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            🛒 Grocery
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600 flex-shrink-0">
            🛒 Grocery
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md mx-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <Search size={18} className="text-muted-foreground" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart size={20} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User size={18} className="mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-destructive"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button size="sm" variant="default">
                  <LogIn size={18} className="mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border mt-3 pt-3 space-y-3">
            {/* Search for Mobile */}
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900"
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                Products
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                Contact
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="space-y-2 border-t border-border pt-3">
              <Link href="/cart" className="block">
                <Button className="w-full" variant="outline">
                  <ShoppingCart size={18} className="mr-2" />
                  Cart ({getItemCount()})
                </Button>
              </Link>

              {session?.user ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button className="w-full" variant="outline">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth/login" className="block">
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
