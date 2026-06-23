'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: June 23, 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Grocery, we are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information in connection with our business.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">Personal Information You Provide:</h3>
                <p className="text-muted-foreground">
                  We collect information you provide directly, such as when you create an account, place an order, or contact us. This may include your name, email address, phone number, postal address, and payment information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Automatically Collected Information:</h3>
                <p className="text-muted-foreground">
                  We automatically collect certain information about your device and how you interact with our website, including IP address, browser type, and pages visited.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>To process and fulfill your orders</li>
              <li>To send transactional emails and order updates</li>
              <li>To improve our website and services</li>
              <li>To personalize your shopping experience</li>
              <li>To comply with legal obligations</li>
              <li>To prevent fraud and enhance security</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us at privacy@grocery.com.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">7. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the "Last updated" date above.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded text-muted-foreground">
              <p>Email: privacy@grocery.com</p>
              <p>Address: 123 Market Street, Mumbai, India 400001</p>
              <p>Phone: +91-1234567890</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
