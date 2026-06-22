import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Leaf, Truck, Heart, Award } from 'lucide-react'

export default function AboutPage() {
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
        <section className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-bold text-foreground">About Grocery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for fresh, quality groceries delivered right to your doorstep
          </p>
        </section>

        {/* Our Story */}
        <section className="bg-white dark:bg-slate-800 rounded-lg p-8 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Grocery was founded with a simple mission: to make fresh, quality groceries accessible to everyone. We believe that everyone deserves access to premium products without compromising on convenience or cost.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            What started as a small initiative has grown into a trusted platform serving thousands of customers across the region. We work directly with local farmers and trusted suppliers to ensure you get the freshest products at the best prices.
          </p>
        </section>

        {/* Our Values */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Leaf,
                title: 'Quality & Freshness',
                description: 'We source only the finest products from trusted suppliers and local farmers to ensure maximum freshness and quality.',
              },
              {
                icon: Truck,
                title: 'Fast & Reliable Delivery',
                description: 'Quick delivery times with reliable service to ensure your groceries arrive fresh and on time.',
              },
              {
                icon: Heart,
                title: 'Customer Care',
                description: 'Your satisfaction is our priority. We provide excellent customer support and easy returns.',
              },
              {
                icon: Award,
                title: 'Best Prices',
                description: 'We offer competitive pricing without compromising on quality. Your wallet deserves the best.',
              },
            ].map((value, idx) => {
              const Icon = value.icon
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-3"
                >
                  <Icon size={32} className="text-primary-600" />
                  <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* By the Numbers */}
        <section className="bg-primary-600 rounded-lg p-12 text-white space-y-8">
          <h2 className="text-3xl font-bold">By The Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: '50K+', label: 'Happy Customers' },
              { number: '1000+', label: 'Products Available' },
              { number: '100%', label: 'Fresh & Quality' },
              { number: '24/7', label: 'Customer Support' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Our Team</h2>
          <p className="text-muted-foreground">
            Our team consists of passionate individuals dedicated to bringing you the best grocery shopping experience. From farmers to delivery partners, everyone is committed to your satisfaction.
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white dark:bg-slate-800 rounded-lg p-8 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Why Choose Us?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold mt-1">✓</span>
              <span>Wide selection of fresh fruits, vegetables, dairy, and pantry items</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold mt-1">✓</span>
              <span>Competitive pricing with regular discounts and offers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold mt-1">✓</span>
              <span>Quick and reliable delivery to your doorstep</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold mt-1">✓</span>
              <span>Easy returns and money-back guarantee</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold mt-1">✓</span>
              <span>24/7 customer support for your queries</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold mt-1">✓</span>
              <span>Secure online payment options</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold text-foreground">Ready to Shop?</h2>
          <p className="text-muted-foreground">
            Discover our fresh products and enjoy shopping with Grocery
          </p>
          <Link href="/products">
            <Button size="lg">Start Shopping Now</Button>
          </Link>
        </section>
      </div>
    </main>
  )
}
