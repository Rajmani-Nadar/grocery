'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  const [email, setEmail] = React.useState('')
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // TODO: Add subscription logic
      setIsSubscribed(true)
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <footer className="border-t border-border bg-slate-50 dark:bg-slate-900 mt-20">
      {/* Newsletter Section */}
      <div className="container-custom py-12 mb-8">
        <div className="max-w-md">
          <h3 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h3>
          <p className="text-muted-foreground mb-4">
            Get updates on new products and upcoming sales
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" variant="default">
              {isSubscribed ? '✓ Subscribed' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-bold text-lg mb-4">About Grocery</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Fresh groceries delivered to your doorstep with premium quality and competitive prices.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Grocery Inc. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-primary-600 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-primary-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-primary-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products?category=fruits"
                  className="text-sm hover:text-primary-600 transition-colors"
                >
                  Fruits
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=vegetables"
                  className="text-sm hover:text-primary-600 transition-colors"
                >
                  Vegetables
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=dairy"
                  className="text-sm hover:text-primary-600 transition-colors"
                >
                  Dairy
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=bakery"
                  className="text-sm hover:text-primary-600 transition-colors"
                >
                  Bakery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-primary-600" />
                <span>+91-1234567890</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-primary-600" />
                <a href="mailto:support@grocery.com" className="hover:text-primary-600">
                  support@grocery.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
                <span>123 Market Street, Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="hover:text-primary-600 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/terms" className="hover:text-primary-600 transition-colors">
                Terms of Service
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/faq" className="hover:text-primary-600 transition-colors">
                FAQ
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
