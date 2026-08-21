'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, Eye, Mail, MapPin, Minus, Phone, Search, SearchX, ShieldCheck, UserRound, Users, X } from 'lucide-react'
import Link from 'next/link'

export interface AddressRecord {
  id: string
  type: string
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

export interface OrderSummary {
  id: string
  orderNumber: string
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

export interface CustomerRecord {
  id: string
  name: string | null
  email: string
  phone?: string | null
  image?: string | null
  createdAt: string
  addresses: AddressRecord[]
  orders: OrderSummary[]
}

const ITEMS_PER_PAGE = 10
const paidStatuses = ['PAID', 'COMPLETED', 'CAPTURED']
const codStatuses = ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'PACKED']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(name: string | null | undefined) {
  return name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'NA'
}

function spentByCustomer(customer: CustomerRecord) {
  return customer.orders.reduce((sum, order) => {
    const paid = paidStatuses.includes(order.paymentStatus)
    const codEligible = order.paymentMethod === 'CASH_ON_DELIVERY' && codStatuses.includes(order.orderStatus)
    return paid || codEligible ? sum + order.total : sum
  }, 0)
}

function orderStatusStyles(status: string) {
  if (status === 'DELIVERED') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (['PROCESSING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(status)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (['PENDING', 'PAYMENT_FAILED'].includes(status)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (['CANCELLED', 'RETURNED'].includes(status)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function paymentStatusStyles(status: string) {
  if (paidStatuses.includes(status)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (['PENDING', 'AUTHORIZED'].includes(status)) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  if (['FAILED', 'CANCELLED', 'REFUNDED'].includes(status)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

export default function CustomersClient({ customerData }: { customerData: CustomerRecord[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredCustomers = useMemo(() => customerData.filter((customer) =>
    (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  ), [customerData, searchQuery])
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)
  const paginatedCustomers = useMemo(() => filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredCustomers, currentPage])
  const start = (currentPage - 1) * ITEMS_PER_PAGE

  useEffect(() => setCurrentPage(1), [searchQuery])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsDrawerOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])
  useEffect(() => {
    if (!isDrawerOpen) setSelectedCustomer(null)
  }, [isDrawerOpen])

  const closeDrawer = () => setIsDrawerOpen(false)
  const cards = [
    ['Total Customers', customerData.length, Users],
    ['Active Customers', customerData.filter((customer) => customer.orders.length > 0).length, UserRound],
    ['New Customers Today', customerData.filter((customer) => new Date(customer.createdAt) >= new Date(new Date().setHours(0, 0, 0, 0))).length, Calendar],
    ['Total Addresses Saved', customerData.reduce((sum, customer) => sum + customer.addresses.length, 0), MapPin],
  ] as const

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)] bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="sticky top-0 z-20 overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-900/10 backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Users className="h-6 w-6" /></div><h1 className="text-3xl font-bold tracking-tight">Customers</h1><p className="mt-2 text-sm text-emerald-50">Manage registered customers and their account activity.</p></div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto"><div className="relative min-w-0 sm:min-w-[300px]"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-200" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} type="search" placeholder="Search by name or email" aria-label="Search customers" className="w-full rounded-full border border-white/20 bg-white/15 py-3 pl-11 pr-11 text-sm text-white placeholder:text-emerald-100 outline-none transition focus:bg-white/20 focus:ring-2 focus:ring-white/60" />{searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear customer search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-emerald-100 hover:bg-white/15"><X className="h-4 w-4" /></button>}</div><span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-medium"><Users className="h-4 w-4" />{filteredCustomers.length} matching</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon], index) => <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.3 }} whileHover={{ y: -4 }} className="group rounded-3xl border border-border/70 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-lg shadow-slate-200/50 dark:from-slate-900 dark:to-emerald-950/20 dark:shadow-black/20"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p></div><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 shadow-sm transition group-hover:rotate-6 group-hover:scale-110 dark:bg-emerald-900/40 dark:text-emerald-300"><Icon className="h-5 w-5" /></div></div></motion.div>)}</div>

        <div className="overflow-hidden rounded-3xl border border-border/70 bg-white/90 shadow-xl shadow-slate-200/50 backdrop-blur dark:bg-slate-900/90 dark:shadow-black/20"><div className="overflow-x-auto"><table className="min-w-full border-collapse text-left"><thead className="sticky top-0 z-10 bg-slate-50/95 text-sm text-muted-foreground backdrop-blur dark:bg-slate-800/95"><tr className="border-b border-border">{['Customer', 'Email', 'Phone', 'Joined On', 'Orders', 'Total Spent', 'Status', 'Actions'].map((column) => <th key={column} className="px-4 py-4 font-semibold">{column}</th>)}</tr></thead><tbody>
          {paginatedCustomers.length === 0 ? <tr><td colSpan={8} className="px-4 py-16 text-center"><div className="mx-auto flex max-w-sm flex-col items-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 dark:border-emerald-900 dark:bg-emerald-950/20"><SearchX className="mb-3 h-8 w-8 text-emerald-600" /><p className="text-lg font-semibold text-foreground">No customers found.</p><p className="mt-1 text-sm text-muted-foreground">Try a different name or email.</p></div></td></tr> : paginatedCustomers.map((customer, index) => <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.025 }} key={customer.id} className="border-b border-border/70 transition hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white shadow-md">{customer.image ? <img src={customer.image} alt={customer.name || 'Customer'} className="h-10 w-10 object-cover" /> : getInitials(customer.name)}</div><p className="font-medium text-foreground">{customer.name || 'Unnamed Customer'}</p></div></td><td className="px-4 py-4 text-sm text-muted-foreground">{customer.email}</td><td className="px-4 py-4 text-sm text-muted-foreground">{customer.phone || 'Not provided'}</td><td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(customer.createdAt)}</td><td className="px-4 py-4 text-sm font-medium text-foreground">{customer.orders.length}</td><td className="px-4 py-4 text-sm font-semibold text-primary">{formatCurrency(spentByCustomer(customer))}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${customer.orders.length > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{customer.orders.length > 0 ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}{customer.orders.length > 0 ? 'Active' : 'No Orders'}</span></td><td className="px-4 py-4"><motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={() => { setSelectedCustomer(customer); setIsDrawerOpen(true) }} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:text-emerald-300"><Eye className="h-4 w-4" />View Details</motion.button></td></motion.tr>)}</tbody></table></div>
          {filteredCustomers.length > 0 && <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-slate-50/95 px-4 py-3 backdrop-blur dark:bg-slate-800/95"><p className="text-sm text-muted-foreground">Showing {start + 1} to {Math.min(start + ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}</p><div className="flex gap-2"><button type="button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage <= 1} className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" />Prev</button><button type="button" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= totalPages} className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900">Next<ChevronRight className="h-4 w-4" /></button></div></div>}
        </div>
      </div>

      <AnimatePresence>{isDrawerOpen && selectedCustomer && <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 p-0 sm:p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer}><motion.aside role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="h-full w-full overflow-y-auto bg-white shadow-2xl dark:bg-slate-900 sm:max-w-[470px] sm:rounded-3xl" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3 }} onClick={(event) => event.stopPropagation()}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-emerald-700/95 px-6 py-4 text-white shadow-lg backdrop-blur"><div><h2 id="customer-detail-title" className="text-xl font-semibold">Customer Details</h2><p className="text-sm text-emerald-100">Account overview and order history</p></div><button type="button" onClick={closeDrawer} aria-label="Close customer details" className="rounded-full border border-white/20 p-2 transition hover:bg-white/15"><X className="h-5 w-5" /></button></div><div className="space-y-6 p-6"><section className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg">{selectedCustomer.image ? <img src={selectedCustomer.image} alt={selectedCustomer.name || 'Customer'} className="h-16 w-16 object-cover" /> : getInitials(selectedCustomer.name)}</div><div><h3 className="text-xl font-semibold text-foreground">{selectedCustomer.name || 'Unnamed Customer'}</h3><p className="text-sm text-muted-foreground">Customer ID: {selectedCustomer.id}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="flex gap-3 rounded-2xl border border-border bg-white p-3 dark:bg-slate-900"><Mail className="h-4 w-4 text-muted-foreground" /> <span className="break-all text-sm">{selectedCustomer.email}</span></div><div className="flex gap-3 rounded-2xl border border-border bg-white p-3 dark:bg-slate-900"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="text-sm">{selectedCustomer.phone || 'Not provided'}</span></div><div className="flex gap-3 rounded-2xl border border-border bg-white p-3 dark:bg-slate-900"><Calendar className="h-4 w-4 text-muted-foreground" /> <span className="text-sm">Joined {formatDate(selectedCustomer.createdAt)}</span></div><div className="flex gap-3 rounded-2xl border border-border bg-white p-3 dark:bg-slate-900"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> <span className="text-sm">{selectedCustomer.orders.length > 0 ? 'Active customer' : 'No orders yet'}</span></div></div></section>
        <section><h4 className="mb-3 text-base font-semibold text-foreground">Saved Addresses</h4>{selectedCustomer.addresses.length === 0 ? <p className="text-sm text-muted-foreground">Customer has no saved addresses.</p> : <div className="space-y-3">{selectedCustomer.addresses.map((address) => <div key={address.id} className={`rounded-lg border p-3 ${address.isDefault ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-border bg-slate-50 dark:bg-slate-800'}`}><div className="mb-1 flex justify-between"><span className="text-sm font-medium">{address.type}</span>{address.isDefault && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Default</span>}</div><p className="text-sm text-muted-foreground">{address.fullName}</p><p className="text-sm text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p><p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.postalCode}</p><p className="text-sm text-muted-foreground">{address.country}</p></div>)}</div>}</section>
        <section><h4 className="mb-3 text-base font-semibold text-foreground">Customer Statistics</h4><div className="grid grid-cols-2 gap-3">{[['Total Orders', selectedCustomer.orders.length], ['Completed Orders', selectedCustomer.orders.filter((order) => order.orderStatus === 'DELIVERED').length], ['Pending Orders', selectedCustomer.orders.filter((order) => order.orderStatus === 'PENDING').length], ['Cancelled Orders', selectedCustomer.orders.filter((order) => order.orderStatus === 'CANCELLED').length], ['Total Spent', formatCurrency(spentByCustomer(selectedCustomer))]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-border bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>)}</div></section>
        <section><div className="mb-3 flex items-center justify-between"><h4 className="text-base font-semibold text-foreground">Recent Orders</h4><Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary">View All <ArrowRight className="h-4 w-4" /></Link></div>{selectedCustomer.orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders placed yet.</p> : <div className="space-y-3">{selectedCustomer.orders.slice(0, 5).map((order) => <div key={order.id} className="rounded-lg border border-border bg-slate-50 p-3 dark:bg-slate-800"><div className="flex items-start justify-between gap-2"><div><p className="font-medium">{order.orderNumber}</p><p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p></div><span className="font-semibold">{formatCurrency(order.total)}</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="text-muted-foreground">{order.paymentMethod.replace(/_/g, ' ')}</span><span className={`rounded-full px-2 py-1 font-medium ${paymentStatusStyles(order.paymentStatus)}`}>{order.paymentStatus}</span><span className={`rounded-full px-2 py-1 font-medium ${orderStatusStyles(order.orderStatus)}`}>{order.orderStatus}</span><Link href={`/api/orders/${order.id}`} className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs font-medium dark:bg-slate-900">View Order</Link></div></div>)}</div>}</section>
      </div></motion.aside></motion.div>}</AnimatePresence>
    </main>
  )
}