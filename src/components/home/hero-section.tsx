'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Leaf } from 'lucide-react'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-10 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl dark:bg-primary-900"
        />
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
          className="absolute bottom-10 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl dark:bg-secondary-900"
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full">
              <Leaf size={16} className="text-primary-600" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                Fresh & Organic
              </span>
            </div>

            <h1 className="text-h1 text-slate-900 dark:text-white">
              Fresh Groceries at Your
              <span className="text-primary-600 block">Doorstep</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
              Shop premium quality fruits, vegetables, dairy, and more. Get fresh products with
              fast delivery and competitive prices. Your one-stop grocery solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <div className="text-2xl font-bold text-primary-600">1000+</div>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">50K+</div>
                <p className="text-sm text-muted-foreground">Customers</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">24hr</div>
                <p className="text-sm text-muted-foreground">Delivery</p>
              </div>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            variants={itemVariants}
            className="relative h-96 md:h-full flex items-center justify-center"
          >
            <motion.div
              animate={floatingAnimation}
              className="text-center"
            >
              <div className="text-9xl">🥬</div>
            </motion.div>
            <motion.div
              animate={{
                ...floatingAnimation,
                transition: { ...floatingAnimation.transition, delay: 0.2 },
              }}
              className="absolute top-20 right-10 text-6xl"
            >
              🍎
            </motion.div>
            <motion.div
              animate={{
                ...floatingAnimation,
                transition: { ...floatingAnimation.transition, delay: 0.4 },
              }}
              className="absolute bottom-20 left-10 text-6xl"
            >
              🥕
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
