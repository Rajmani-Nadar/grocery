// Global types for the application

export type UserRole = 'ADMIN' | 'CUSTOMER'

export interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: UserRole
  phone?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  icon?: string | null
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  discountPrice?: number | null
  discount?: number | null
  categoryId: string
  category?: Category
  sku: string
  stock: number
  weight?: number | null
  images: string[]
  rating: number
  reviewCount: number
  isFeatured: boolean
  isActive: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface CartItem {
  id: string
  productId: string
  product?: Product
  quantity: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

export interface Address {
  id: string
  userId: string
  type: 'HOME' | 'WORK' | 'OTHER'
  fullName: string
  phone: string
  email?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  discount?: number | null
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: User
  items: OrderItem[]
  subtotal: number
  shippingCharge: number
  tax: number
  discount?: number | null
  total: number
  shippingAddressId?: string | null
  shippingAddress?: Address
  billingAddressId?: string | null
  billingAddress?: Address
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  trackingNumber?: string | null
  estimatedDelivery?: Date
  deliveredAt?: Date | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH_ON_DELIVERY' | 'WALLET'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'CONFIRMED' 
  | 'PACKED' 
  | 'SHIPPED' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURNED'

export interface Review {
  id: string
  productId: string
  userId: string
  user?: User
  rating: number
  title: string
  comment?: string | null
  helpful: number
}

export interface Wishlist {
  id: string
  userId: string
  productId: string
  product?: Product
}

export interface Coupon {
  id: string
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  maxUses?: number | null
  uses: number
  minOrderValue?: number | null
  maxDiscount?: number | null
  expiresAt: Date
  isActive: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FilterOptions {
  categories?: string[]
  priceRange?: [number, number]
  ratings?: number[]
  inStock?: boolean
  search?: string
  sortBy?: 'price' | 'rating' | 'newest' | 'featured'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
