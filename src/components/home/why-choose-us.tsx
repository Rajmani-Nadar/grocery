'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Truck, Shield, Zap, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your groceries delivered within 24 hours at your doorstep',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Multiple payment options with SSL encryption for your safety',
  },
  {
    icon: Award,
    title: 'Best Prices',
    description: 'Competitive pricing with regular discounts and offers',
  },
  {
    icon: Zap,
    title: 'Fresh Products',
    description: 'Handpicked fresh products sourced directly from farms',
  },
]

export function WhyChooseUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-h2 mb-4">Why Choose Us</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best grocery shopping with our premium services
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-full">
                        <Icon size={32} className="text-primary-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
