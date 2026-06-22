'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    rating: 5,
    comment:
      'Best grocery shopping experience! Fresh products delivered within 24 hours. Highly recommended!',
    avatar: '👩‍🦰',
  },
  {
    name: 'Raj Patel',
    location: 'Bangalore, India',
    rating: 5,
    comment:
      'Excellent service and competitive prices. The app is very user-friendly. Love shopping here!',
    avatar: '👨‍💼',
  },
  {
    name: 'Anjali Singh',
    location: 'Delhi, India',
    rating: 4,
    comment:
      'Great variety of products and fast delivery. Sometimes items are out of stock, but overall very good.',
    avatar: '👩‍⚕️',
  },
  {
    name: 'Vikram Kumar',
    location: 'Hyderabad, India',
    rating: 5,
    comment:
      'Amazing quality and prices are unbeatable. Customer service is also very responsive.',
    avatar: '👨‍🎓',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real reviews from our satisfied customers
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="text-6xl">
                      {testimonials[current].avatar}
                    </div>
                    <div className="flex justify-center gap-1">
                      {Array(testimonials[current].rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className="fill-yellow-400 text-yellow-400"
                          />
                        ))}
                    </div>
                    <p className="text-lg italic text-muted-foreground">
                      "{testimonials[current].comment}"
                    </p>
                    <div>
                      <p className="font-bold">
                        {testimonials[current].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[current].location}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === current
                        ? 'bg-primary-600 w-8'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
