'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Phone, Mail, MapPin, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold text-foreground">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Get in touch with our support team.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              {
                icon: Phone,
                title: 'Phone',
                details: ['+91-1234567890', '+91-0987654321'],
              },
              {
                icon: Mail,
                title: 'Email',
                details: ['support@grocery.com', 'info@grocery.com'],
              },
              {
                icon: MapPin,
                title: 'Address',
                details: ['123 Market Street', 'Mumbai, India 400001'],
              },
              {
                icon: Clock,
                title: 'Business Hours',
                details: ['Mon - Sun: 9:00 AM - 9:00 PM', 'Holidays: 10:00 AM - 8:00 PM'],
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <Card key={idx} className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon size={24} className="text-primary-600" />
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <div className="space-y-1">
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-muted-foreground text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your query..."
                    rows={5}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900 resize-none"
                    required
                  ></textarea>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  <Send size={18} className="mr-2" />
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>

              {/* FAQ */}
              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick FAQs</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">What are your delivery times?</p>
                    <p className="text-muted-foreground">We deliver within 24-48 hours of order placement in most areas.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Do you accept returns?</p>
                    <p className="text-muted-foreground">Yes, we accept returns within 7 days if the product is unopened and in original condition.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">What payment methods do you accept?</p>
                    <p className="text-muted-foreground">We accept credit cards, debit cards, net banking, UPI, and digital wallets.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
