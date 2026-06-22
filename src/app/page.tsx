import React from 'react'
import { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { TestimonialsSection } from '@/components/home/testimonials-section'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Shop fresh groceries online with fast delivery and best prices.',
}

export default function HomePage() {
  return (
    <main className="w-full">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyChooseUs />
      <TestimonialsSection />
    </main>
  )
}
