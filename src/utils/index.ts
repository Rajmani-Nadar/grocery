// Utility functions

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formatDate = (date: Date | string, format = 'short'): string => {
  const d = new Date(date)
  if (format === 'short') {
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const calculateDiscount = (
  originalPrice: number,
  discountPrice: number
): number => {
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastRun >= delay) {
      func(...args)
      lastRun = now
    }
  }
}

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

export const cn = (...classes: (string | undefined | boolean)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const getImageUrl = (
  url: string,
  width?: number,
  height?: number
): string => {
  if (!url) return '/placeholder-image.png'
  if (url.includes('unsplash.com')) {
    const params = []
    if (width) params.push(`w=${width}`)
    if (height) params.push(`h=${height}`)
    if (params.length > 0) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}${params.join('&')}`
    }
  }
  return url
}

export const calculateDeliveryDate = (daysFromNow = 2): Date => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

export const getStockStatus = (stock: number): { status: string; color: string } => {
  if (stock === 0) return { status: 'Out of Stock', color: 'text-red-600' }
  if (stock < 10) return { status: 'Low Stock', color: 'text-yellow-600' }
  return { status: 'In Stock', color: 'text-green-600' }
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export const roundRating = (rating: number): number => {
  return Math.round(rating * 2) / 2
}

export const generateSEOSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getQueryParams = (search: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const queryString = search.startsWith('?') ? search.substring(1) : search
  
  queryString.split('&').forEach((pair) => {
    const [key, value] = pair.split('=')
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  })
  
  return params
}

export const buildQueryString = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}
