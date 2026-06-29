'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

const partyParticleTypes = ['star', 'leaf', 'bag', 'apple', 'carrot', 'ribbon'] as const

type ParticleType = (typeof partyParticleTypes)[number]

type ParticleConfig = {
  id: number
  left: number
  size: number
  delay: number
  drift: number
  rotate: number
  type: ParticleType
}

const GroceryParticle = ({ type }: { type: ParticleType }) => {
  switch (type) {
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.5L14.6 8.9L21.5 9.6L16.3 13.9L17.9 20.7L12 17.3L6.1 20.7L7.7 13.9L2.5 9.6L9.4 8.9L12 2.5Z" fill="#fbbf24" />
        </svg>
      )
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 18C10 18 13 15 14 12C15 9 14 6 12 4C10 2 8 2 6 3" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 6C14 6 11 9 10 12C9 15 11 18 14 18" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'bag':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8H18V19C18 20.1046 17.1046 21 16 21H8C6.89543 21 6 20.1046 6 19V8Z" fill="#60a5fa" />
          <path d="M9 8V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8" stroke="#1d4ed8" strokeWidth="2" />
        </svg>
      )
    case 'apple':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7.5C16.8 6.1 18.6 5 20 5" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 21C16.4 21 19.5 18 20 14.6C20.5 11.2 18 8 14.5 8C12.9 8 11.4 8.8 10.5 10.1C9.6 8.8 8.1 8 6.5 8C3 8 0.5 11.2 1 14.6C1.5 18 4.6 21 9 21H12Z" fill="#ef4444" />
          <path d="M12 8C12 6.34 13.34 5 15 5" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'carrot':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 2.5L13 5.5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 6L22 16L18 20L8 10L12 6Z" fill="#f97316" />
          <path d="M8.5 9.5L5.5 12.5" stroke="#bb5c0c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'ribbon':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3H8C6.89543 3 6 3.89543 6 5V17L12 21L18 17V5C18 3.89543 17.1046 3 16 3Z" fill="#f472b6" />
          <path d="M8 5H16" stroke="#be185d" strokeWidth="1.5" />
        </svg>
      )
    default:
      return null
  }
}

const partyParticles = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(8, 92),
    size: randomBetween(18, 28),
    delay: randomBetween(0, 400),
    drift: randomBetween(-18, 18),
    rotate: randomBetween(-160, 160),
    type: partyParticleTypes[i % partyParticleTypes.length],
  }))

const PartyPopper = ({ side, isBurst }: { side: 'left' | 'right'; isBurst: boolean }) => {
  const xOffset = side === 'left' ? -24 : 24
  const transformOrigin = side === 'left' ? 'left bottom' : 'right bottom'

  return (
    <motion.div
      initial={{ y: 120, opacity: 0, scale: 0.9 }}
      animate={{
        y: isBurst ? [120, 0, 18] : [120, 0],
        opacity: [0, 1],
        rotate: isBurst ? (side === 'left' ? [-8, 0, 6] : [8, 0, -6]) : 0,
      }}
      transition={{
        duration: 1,
        ease: 'easeOut',
        times: isBurst ? [0, 0.5, 1] : [0, 1],
      }}
      style={{ transformOrigin }}
      className={`pointer-events-none absolute bottom-8 ${side === 'left' ? 'left-6' : 'right-6'} z-[1000]`}
    >
      <svg width="92" height="118" viewBox="0 0 92 118" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 90C20 90 10 108 14 112C18 116 32 112 32 112L20 90Z" fill="#f59e0b" />
        <path d="M18 62L74 4L88 18L32 76L18 62Z" fill="#fde68a" />
        <path d="M16 60L72 2L86 16L30 74L16 60Z" fill="#f97316" />
        <path d="M30 72L66 36" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 80L54 52" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 28L44 6" stroke="#db2777" strokeWidth="4" strokeLinecap="round" />
        <path d="M54 40L76 18" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

export default function OrderCelebration() {
  const [show, setShow] = useState(true)
  const [burst, setBurst] = useState(false)
  const particles = useMemo(() => partyParticles(22), [])

  useEffect(() => {
    let burstTimer: number | undefined
    let hideTimer: number | undefined

    const start = async () => {
      const confetti = (await import('canvas-confetti')).default

      burstTimer = window.setTimeout(() => {
        setBurst(true)

        const fire = (originX: number, spread: number, particleCount: number) => {
          confetti({
            particleCount,
            angle: originX < 0.5 ? 60 : 120,
            spread,
            startVelocity: randomBetween(42, 58),
            origin: { x: originX, y: 1.05 },
            colors,
            gravity: 0.9,
            decay: 0.9,
            drift: originX < 0.5 ? 0.6 : -0.6,
            ticks: 200,
            scalar: randomBetween(0.8, 1.1),
          })
        }

        fire(0.12, 90, 110)
        fire(0.88, 90, 110)
        fire(0.5, 110, 80)
      }, 280)

      hideTimer = window.setTimeout(() => {
        setShow(false)
      }, 3200)
    }

    start()

    return () => {
      if (burstTimer) window.clearTimeout(burstTimer)
      if (hideTimer) window.clearTimeout(hideTimer)
    }
  }, [])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none fixed inset-0 z-[999] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-transparent" />
          <PartyPopper side="left" isBurst={burst} />
          <PartyPopper side="right" isBurst={burst} />

          <div className="absolute inset-0 overflow-hidden">
            {particles.map(({ id, left, size, delay, drift, rotate, type }) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 0, x: 0, rotate }}
                animate={{ opacity: [0, 1, 1, 0], y: [-16, -110, -210, -320], x: [0, drift, drift * 1.4, drift * 1.7], rotate: rotate + 240 }}
                transition={{ duration: 3.1, ease: 'easeOut', delay: delay / 1000 }}
                className="absolute bottom-16"
                style={{ left: `${left}%`, width: size, height: size }}
              >
                <GroceryParticle type={type} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
