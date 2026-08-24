'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, Minus, Plus, RotateCcw, X } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

const fallbackImage = ''

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const validImages = images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([])
  const image = validImages[selectedIndex]
  const hasImages = validImages.length > 0
  const displayImage = image && !failedImages[image] ? image : fallbackImage

  useEffect(() => {
    setIsMainImageLoaded(false)
    thumbnailRefs.current[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedIndex])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft') changeImage(-1)
      if (event.key === 'ArrowRight') changeImage(1)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, selectedIndex, validImages.length])

  const changeImage = (direction: number) => {
    if (validImages.length < 2) return
    setSelectedIndex((current) => (current + direction + validImages.length) % validImages.length)
    setZoom(1)
  }

  const markImageFailed = (source: string) => {
    setFailedImages((current) => ({ ...current, [source]: true }))
    setIsMainImageLoaded(true)
  }

  const updateZoomOrigin = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    setZoomOrigin({ x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 })
  }

  const openLightbox = () => {
    if (!hasImages) return
    setZoom(1)
    setLightboxOpen(true)
  }

  const handleTouchStart = (event: React.TouchEvent) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null }
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const distance = event.changedTouches[0]?.clientX - touchStartX.current
    if (Math.abs(distance) > 40) changeImage(distance > 0 ? -1 : 1)
    touchStartX.current = null
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {validImages.length > 1 && <div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:w-20 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {validImages.map((source, index) => <button key={`${source}-${index}`} ref={(element) => { thumbnailRefs.current[index] = element }} type="button" onClick={() => setSelectedIndex(index)} aria-label={`View image ${index + 1} of ${validImages.length}`} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition hover:-translate-y-0.5 ${selectedIndex === index ? 'border-emerald-500 shadow-lg shadow-emerald-200/70' : 'border-border hover:border-emerald-300'}`}>
            {failedImages[source] ? <ImageOff className="m-auto h-5 w-5 text-muted-foreground" /> : <Image src={source} alt={`${productName} thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" loading="lazy" onError={() => markImageFailed(source)} />}
          </button>)}
        </div>}

        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-100/50 dark:border-emerald-900/40 dark:bg-slate-800 dark:shadow-black/20" onMouseMove={updateZoomOrigin} onMouseLeave={() => setZoom(1)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={openLightbox} onDoubleClick={() => setZoom((current) => current === 1 ? 2 : 1)}>
            {!isMainImageLoaded && hasImages && <div className="absolute inset-0 z-10 animate-pulse bg-slate-100 dark:bg-slate-700" />}
            {displayImage ? <Image key={displayImage} src={displayImage} alt={productName} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-4 transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }} onLoad={() => setIsMainImageLoaded(true)} onError={() => markImageFailed(image)} /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground"><ImageOff className="h-12 w-12" /><span>No image available.</span></div>}
            {validImages.length > 1 && <span className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">{selectedIndex + 1} / {validImages.length}</span>}
            <button type="button" aria-label="Open full screen image viewer" onClick={(event) => { event.stopPropagation(); openLightbox() }} className="absolute bottom-4 right-4 rounded-full bg-white/85 p-3 text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100 dark:bg-slate-900/85 dark:text-white"><Maximize2 className="h-5 w-5" /></button>
            {validImages.length > 1 && <><button type="button" aria-label="Previous product image" onClick={(event) => { event.stopPropagation(); changeImage(-1) }} className="absolute left-3 top-1/2 rounded-full bg-white/85 p-2 text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100 dark:bg-slate-900/85 dark:text-white"><ChevronLeft /></button><button type="button" aria-label="Next product image" onClick={(event) => { event.stopPropagation(); changeImage(1) }} className="absolute right-3 top-1/2 rounded-full bg-white/85 p-2 text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 focus:opacity-100 dark:bg-slate-900/85 dark:text-white"><ChevronRight /></button></>}
          </div>
        </div>
      </div>

      <AnimatePresence>{lightboxOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 p-4 backdrop-blur-md sm:p-8" role="dialog" aria-modal="true" aria-label={`${productName} image viewer`} onClick={() => setLightboxOpen(false)}>
        <div className="flex justify-end"><button type="button" aria-label="Close image viewer" onClick={() => setLightboxOpen(false)} className="rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"><X /></button></div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(event) => event.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onDoubleClick={() => setZoom((current) => current === 1 ? 2 : 1)}>
          {displayImage && <motion.div key={`${displayImage}-${zoom}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative h-full w-full"><Image src={displayImage} alt={`${productName} image ${selectedIndex + 1}`} fill sizes="100vw" className="object-contain" style={{ transform: `scale(${zoom})`, transition: 'transform 200ms ease' }} onError={() => markImageFailed(image)} /></motion.div>}
          {validImages.length > 1 && <><button type="button" aria-label="Previous product image" onClick={() => changeImage(-1)} className="absolute left-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronLeft className="h-7 w-7" /></button><button type="button" aria-label="Next product image" onClick={() => changeImage(1)} className="absolute right-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><ChevronRight className="h-7 w-7" /></button></>}
          <div className="absolute bottom-2 right-2 flex gap-2 sm:bottom-4 sm:right-4"><button type="button" aria-label="Zoom out" onClick={() => setZoom((current) => Math.max(1, current - 0.5))} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><Minus /></button><button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><RotateCcw /></button><button type="button" aria-label="Zoom in" onClick={() => setZoom((current) => Math.min(3, current + 0.5))} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><Plus /></button></div>
        </div>
        {validImages.length > 1 && <div className="flex justify-center gap-2 overflow-x-auto py-3">{validImages.map((source, index) => <button key={`lightbox-${source}-${index}`} type="button" onClick={() => setSelectedIndex(index)} aria-label={`View image ${index + 1} of ${validImages.length}`} className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${selectedIndex === index ? 'border-emerald-400' : 'border-white/20'}`}><Image src={source} alt={`${productName} thumbnail ${index + 1}`} fill sizes="56px" className="object-cover" loading="lazy" /></button>)}</div>}
      </motion.div>}</AnimatePresence>
    </div>
  )
}
