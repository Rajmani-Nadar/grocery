'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Eye, Mail, MapPin, Phone, Search, SearchX, ShieldCheck, UserRound, Users, X } from 'lucide-react'
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="sticky top-0 z-20 flex flex-col gap-4 bg-slate-50/95 py-2 backdrop-blur lg:flex-row lg:items-center lg:justify-between dark:bg-slate-950/95">
          <div><h1 className="text-3xl font-bold text-foreground">Customers</h1><p className="mt-1 text-sm text-muted-foreground">Manage registered customers and their account activity.</p></div>
          <div className="flex items-center gap-3"><div className="relative min-w-[280px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} type="search" placeholder="Search by name or email" aria-label="Search customers" className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-900" /></div><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"><Users className="h-4 w-4" />{customerData.length} total</span></div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold text-foreground">{value}</p></div><Icon className="h-5 w-5 text-primary" /></div></div>)}</div>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:bg-slate-900"><div className="overflow-x-auto"><table className="min-w-full border-collapse text-left"><thead className="sticky top-0 z-10 bg-slate-50 text-sm text-muted-foreground dark:bg-slate-800"><tr className="border-b border-border">{['Customer', 'Email', 'Phone', 'Joined On', 'Orders', 'Total Spent', 'Status', 'Actions'].map((column) => <th key={column} className="px-4 py-3 font-medium">{column}</th>)}</tr></thead><tbody>
          {paginatedCustomers.length === 0 ? <tr><td colSpan={8} className="px-4 py-16 text-center"><SearchX className="mx-auto mb-3 h-8 w-8 text-slate-500" /><p className="text-lg font-semibold text-foreground">No customers found.</p></td></tr> : paginatedCustomers.map((customer) => <tr key={customer.id} className="border-b border-border transition hover:bg-slate-50 dark:hover:bg-slate-800/70"><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">{customer.image ? <img src={customer.image} alt={customer.name || 'Customer'} className="h-10 w-10 object-cover" /> : getInitials(customer.name)}</div><p className="font-medium text-foreground">{customer.name || 'Unnamed Customer'}</p></div></td><td className="px-4 py-4 text-sm text-muted-foreground">{customer.email}</td><td className="px-4 py-4 text-sm text-muted-foreground">{customer.phone || 'Not provided'}</td><td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(customer.createdAt)}</td><td className="px-4 py-4 text-sm font-medium text-foreground">{customer.orders.length}</td><td className="px-4 py-4 text-sm font-medium text-primary">{formatCurrency(spentByCustomer(customer))}</td><td className="px-4 py-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{customer.orders.length > 0 ? 'Active' : 'No Orders'}</span></td><td className="px-4 py-4"><button type="button" onClick={() => { setSelectedCustomer(customer); setIsDrawerOpen(true) }} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"><Eye className="h-4 w-4" />View Details</button></td></tr>)}</tbody></table></div>
          {filteredCustomers.length > 0 && <div className="flex items-center justify-between border-t border-border bg-slate-50 px-4 py-3 dark:bg-slate-800"><p className="text-sm text-muted-foreground">Showing {start + 1} to {Math.min(start + ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}</p><div className="flex gap-2"><button type="button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage <= 1} className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" />Prev</button><button type="button" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= totalPages} className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:bg-slate-900">Next<ChevronRight className="h-4 w-4" /></button></div></div>}
        </div>
      </div>

      <AnimatePresence>{isDrawerOpen && selectedCustomer && <motion.div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer}><motion.aside role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="h-full w-full overflow-y-auto bg-white dark:bg-slate-900 sm:max-w-[470px]" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3 }} onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-border px-6 py-4"><div><h2 id="customer-detail-title" className="text-xl font-semibold text-foreground">Customer Details</h2><p className="text-sm text-muted-foreground">Account overview and order history</p></div><button type="button" onClick={closeDrawer} aria-label="Close customer details" className="rounded-md border border-border p-2 text-foreground hover:border-primary hover:text-primary"><X className="h-5 w-5" /></button></div><div className="space-y-6 p-6"><section className="rounded-xl border border-border bg-slate-50 p-5 dark:bg-slate-800/70"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary">{selectedCustomer.image ? <img src={selectedCustomer.image} alt={selectedCustomer.name || 'Customer'} className="h-16 w-16 object-cover" /> : getInitials(selectedCustomer.name)}</div><div><h3 className="text-xl font-semibold text-foreground">{selectedCustomer.name || 'Unnamed Customer'}</h3><p className="text-sm text-muted-foreground">Customer ID: {selectedCustomer.id}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="flex gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900"><Mail className="h-4 w-4 text-muted-foreground" /> <span className="break-all text-sm">{selectedCustomer.email}</span></div><div className="flex gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="text-sm">{selectedCustomer.phone || 'Not provided'}</span></div><div className="flex gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900"><Calendar className="h-4 w-4 text-muted-foreground" /> <span className="text-sm">Joined {formatDate(selectedCustomer.createdAt)}</span></div><div className="flex gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> <span className="text-sm">{selectedCustomer.orders.length > 0 ? 'Active customer' : 'No orders yet'}</span></div></div></section>
        <section><h4 className="mb-3 text-base font-semibold text-foreground">Saved Addresses</h4>{selectedCustomer.addresses.length === 0 ? <p className="text-sm text-muted-foreground">Customer has no saved addresses.</p> : <div className="space-y-3">{selectedCustomer.addresses.map((address) => <div key={address.id} className={`rounded-lg border p-3 ${address.isDefault ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-border bg-slate-50 dark:bg-slate-800'}`}><div className="mb-1 flex justify-between"><span className="text-sm font-medium">{address.type}</span>{address.isDefault && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Default</span>}</div><p className="text-sm text-muted-foreground">{address.fullName}</p><p className="text-sm text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p><p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.postalCode}</p><p className="text-sm text-muted-foreground">{address.country}</p></div>)}</div>}</section>
        <section><h4 className="mb-3 text-base font-semibold text-foreground">Customer Statistics</h4><div className="grid grid-cols-2 gap-3">{[['Total Orders', selectedCustomer.orders.length], ['Completed Orders', selectedCustomer.orders.filter((order) => order.orderStatus === 'DELIVERED').length], ['Pending Orders', selectedCustomer.orders.filter((order) => order.orderStatus === 'PENDING').length], ['Cancelled Orders', selectedCustomer.orders.filter((order) => order.orderStatus === 'CANCELLED').length], ['Total Spent', formatCurrency(spentByCustomer(selectedCustomer))]].map(([label, value]) => <div key={String(label)} className="rounded-lg border border-border bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>)}</div></section>
        <section><div className="mb-3 flex items-center justify-between"><h4 className="text-base font-semibold text-foreground">Recent Orders</h4><Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-primary">View All <ArrowRight className="h-4 w-4" /></Link></div>{selectedCustomer.orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders placed yet.</p> : <div className="space-y-3">{selectedCustomer.orders.slice(0, 5).map((order) => <div key={order.id} className="rounded-lg border border-border bg-slate-50 p-3 dark:bg-slate-800"><div className="flex items-start justify-between gap-2"><div><p className="font-medium">{order.orderNumber}</p><p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p></div><span className="font-semibold">{formatCurrency(order.total)}</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="text-muted-foreground">{order.paymentMethod.replace(/_/g, ' ')}</span><span className={`rounded-full px-2 py-1 font-medium ${paymentStatusStyles(order.paymentStatus)}`}>{order.paymentStatus}</span><span className={`rounded-full px-2 py-1 font-medium ${orderStatusStyles(order.orderStatus)}`}>{order.orderStatus}</span><Link href={`/api/orders/${order.id}`} className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-xs font-medium dark:bg-slate-900">View Order</Link></div></div>)}</div>}</section>
      </div></motion.aside></motion.div>}</AnimatePresence>
    </main>
  )
}