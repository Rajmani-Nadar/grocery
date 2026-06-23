'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronDown } from 'lucide-react'

const FAQData = [
  {
    question: 'What are your delivery times?',
    answer: 'We deliver within 24-48 hours of order placement in most areas. For remote locations, delivery may take 3-5 business days. You can track your order in real-time through your dashboard.',
  },
  {
    question: 'Do you accept returns?',
    answer: 'Yes, we accept returns within 7 days if the product is unopened and in original condition. To initiate a return, please contact our customer support team at support@grocery.com with your order number.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards, debit cards, net banking, UPI, and digital wallets. All payments are securely processed through encrypted channels to protect your financial information.',
  },
  {
    question: 'How can I track my order?',
    answer: 'You can track your order in real-time by logging into your account and visiting the "My Orders" section in your dashboard. You will also receive email and SMS updates about your delivery status.',
  },
  {
    question: 'Is there a minimum order value?',
    answer: 'No, there is no minimum order value. However, delivery charges may apply to orders below a certain amount. Free delivery is available on orders above ₹500 in selected areas.',
  },
  {
    question: 'How do I apply a coupon code?',
    answer: 'During checkout, you will see a "Coupon Code" field. Enter your coupon code and click "Apply" to see the discount. Coupon codes are often shared through our newsletter and social media channels.',
  },
  {
    question: 'What if I receive damaged or expired products?',
    answer: 'If you receive damaged or expired products, please contact us immediately with photos of the product and packaging. We will replace the product or issue a full refund at your request.',
  },
  {
    question: 'Can I modify or cancel my order?',
    answer: 'Orders can be modified or cancelled within 30 minutes of placement. After 30 minutes, your order enters the fulfillment process and cannot be changed. You can still request a return after delivery.',
  },
  {
    question: 'Do you offer subscription services?',
    answer: 'Yes, we offer subscription plans for frequently purchased items. You can set up recurring deliveries and enjoy special discounts. Manage your subscriptions in your account settings.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page and enter your email address. You will receive a password reset link via email. Follow the link to create a new password.',
  },
]

function FAQAccordion() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {FAQData.map((item, index) => (
        <div key={index} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <p className="font-medium text-foreground text-left flex items-center gap-2">
              <span>?</span>
              {item.question}
            </p>
            <ChevronDown
              size={18}
              className={`transition-transform flex-shrink-0 ${
                expandedIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedIndex === index && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-border">
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function FAQPage() {
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

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about Grocery shopping, delivery, payments, and more.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">General Questions</h2>
            <FAQAccordion />
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
            <h3 className="font-bold text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our customer support team is here to help.
            </p>
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
