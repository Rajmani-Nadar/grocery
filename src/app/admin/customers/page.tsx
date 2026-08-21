import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Search, Users, MapPin, Eye, Mail, Phone, Calendar, UserRound, ArrowRight, ChevronLeft, ChevronRight, SearchX, ShieldCheck } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Admin Customers',
}

interface AddressRecord {
  id: string
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

interface OrderSummary {
  id: string
  orderNumber: string
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string | Date
}

interface CustomerRecord {
  id: string
  name: string | null
  email: string
  phone?: string | null
  image?: string | null
  createdAt: string | Date
  addresses: AddressRecord[]
  orders: OrderSummary[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string | null | undefined) {
  if (!name) return 'NA'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return initials || 'NA'
}

function getOrderStatusStyles(status: string) {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PROCESSING':
    case 'CONFIRMED':
    case 'PACKED':
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'PENDING':
    case 'PAYMENT_FAILED':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'CANCELLED':
    case 'RETURNED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function getPaymentStatusStyles(status: string) {
  switch (status) {
    case 'PAID':
    case 'COMPLETED':
    case 'CAPTURED':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'PENDING':
    case 'AUTHORIZED':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'FAILED':
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function getCardTone(index: number) {
  const tones = [
    'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800',
    'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800',
    'from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-violet-200 dark:border-violet-800',
    'from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 border-sky-200 dark:border-sky-800',
  ]
  return tones[index % tones.length]
}

function getCardIconColor(index: number) {
  const colors = ['bg-emerald-600', 'bg-orange-600', 'bg-violet-600', 'bg-sky-600']
  return colors[index % colors.length]
}

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { payment: true },
      },
    },
  })

  const customerData: CustomerRecord[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    image: customer.image,
    createdAt: customer.createdAt,
    addresses: customer.addresses.map((address) => ({
      id: address.id,
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      email: address.email,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    })),
    orders: customer.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total || 0),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment?.status ?? order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    })),
  }))

  const totalCustomers = customerData.length
  const activeCustomers = customerData.filter((customer) => customer.orders.length > 0).length
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const newCustomersToday = customerData.filter((customer) => new Date(customer.createdAt) >= today).length
  const totalAddressesSaved = customerData.reduce((sum, customer) => sum + customer.addresses.length, 0)

  const searchScript = `
    (() => {
      const pageSize = 10;
      let selectedCustomer = null;
      let isDrawerOpen = false;
      let previouslyFocusedElement = null;
      const rows = Array.from(document.querySelectorAll('[data-customer-row]'));
      const searchInput = document.getElementById('customer-search');
      const prevButton = document.getElementById('customer-prev');
      const nextButton = document.getElementById('customer-next');
      const pageInfo = document.getElementById('customer-page-info');
      const detailPanel = document.getElementById('customer-detail-panel');
      const detailClose = document.querySelectorAll('[data-customer-detail-close]');
      const allCustomers = rows.map((row) => ({
        row,
        name: (row.dataset.name || '').toLowerCase(),
        email: (row.dataset.email || '').toLowerCase(),
      }));

      function applyPagination(items) {
        const page = Number(document.body.dataset.currentPage || '1');
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        rows.forEach((row) => row.style.display = 'none');
        items.slice(start, end).forEach((item) => {
          item.row.style.display = '';
        });

        if (pageInfo) {
          const startLabel = items.length === 0 ? 0 : start + 1;
          const endLabel = Math.min(end, items.length);
          pageInfo.textContent = 'Showing ' + startLabel + ' to ' + endLabel + ' of ' + items.length;
        }

        if (prevButton) prevButton.disabled = page <= 1;
        if (nextButton) nextButton.disabled = page >= totalPages;
      }

      function render() {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        let filtered = allCustomers;
        if (query) {
          filtered = allCustomers.filter((item) => item.name.includes(query) || item.email.includes(query));
        }

        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        let page = Number(document.body.dataset.currentPage || '1');
        if (page > totalPages) page = totalPages;
        document.body.dataset.currentPage = String(page);

        applyPagination(filtered.map((item) => item));

        const rowsVisible = filtered.length > 0 ? filtered.length : 0;
        const emptyState = document.getElementById('customer-empty-state') || document.getElementById('customer-filter-empty-state');
        if (emptyState) emptyState.style.display = rowsVisible === 0 ? '' : 'none';
      }

      searchInput?.addEventListener('input', render);
      prevButton?.addEventListener('click', () => {
        const page = Math.max(1, Number(document.body.dataset.currentPage || '1') - 1);
        document.body.dataset.currentPage = String(page);
        render();
      });
      nextButton?.addEventListener('click', () => {
        const page = Number(document.body.dataset.currentPage || '1') + 1;
        document.body.dataset.currentPage = String(page);
        render();
      });

      function openDetails(id, trigger) {
        const panel = document.getElementById('customer-detail-' + id);
        if (!panel || !detailPanel) return;

        selectedCustomer = id;
        isDrawerOpen = true;
        previouslyFocusedElement = trigger;
        detailPanel.classList.remove('pointer-events-none', 'opacity-0');
        detailPanel.classList.add('opacity-100');
        detailPanel.setAttribute('aria-hidden', 'false');
        detailPanel.style.opacity = '1';
        const dialog = panel.closest('[role="dialog"]');
        dialog?.classList.remove('translate-x-full');
        dialog && (dialog.style.transform = 'translateX(0)');
        document.body.classList.add('overflow-hidden');
        document.querySelectorAll('[data-detail-panel]').forEach((node) => {
          node.classList.add('hidden');
        });
        panel.classList.remove('hidden');
        panel.querySelector('button')?.focus();
      }

      function closeDetails() {
        if (!isDrawerOpen) return;
        isDrawerOpen = false;
        selectedCustomer = null;
        detailPanel?.classList.remove('opacity-100');
        detailPanel?.classList.add('pointer-events-none', 'opacity-0');
        detailPanel?.setAttribute('aria-hidden', 'true');
        detailPanel && (detailPanel.style.opacity = '0');
        const dialog = detailPanel?.querySelector('[role="dialog"]');
        dialog?.classList.add('translate-x-full');
        dialog && (dialog.style.transform = 'translateX(100%)');
        document.body.classList.remove('overflow-hidden');
        previouslyFocusedElement?.focus();
        previouslyFocusedElement = null;
      }

      document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const detailButton = target.closest('[data-customer-detail]');
        if (detailButton) {
          openDetails(detailButton.dataset.customerDetail, detailButton);
        }
      });
      detailClose.forEach((button) => button.addEventListener('click', closeDetails));
      detailPanel?.addEventListener('click', (event) => {
        if (event.target === detailPanel) closeDetails();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeDetails();
      });

      document.body.dataset.currentPage = '1';
      render();
    })();
  `

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-8" data-current-page="1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage registered customers and their account activity.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[280px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="customer-search"
                type="text"
                placeholder="Search by name or email"
                className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Users className="h-4 w-4" />
              {totalCustomers} total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Customers', value: totalCustomers, icon: Users },
            { label: 'Active Customers', value: activeCustomers, icon: UserRound },
            { label: 'New Customers Today', value: newCustomersToday, icon: Calendar },
            { label: 'Total Addresses Saved', value: totalAddressesSaved, icon: MapPin },
          ].map((card, index) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`rounded-xl border bg-gradient-to-br p-5 shadow-sm transition hover:shadow-md ${getCardTone(index)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-white ${getCardIconColor(index)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 text-sm text-muted-foreground dark:bg-slate-800/80">
                <tr className="border-b border-border">
                  {['Customer', 'Email', 'Phone', 'Joined On', 'Orders', 'Total Spent', 'Status', 'Actions'].map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerData.length > 0 ? (
                  customerData.map((customer) => {
                    const orderCount = customer.orders.length
                    const totalSpent = customer.orders.reduce((sum, order) => {
                      const paid = ['PAID', 'COMPLETED', 'CAPTURED'].includes(order.paymentStatus)
                      const codEligible = order.paymentMethod === 'CASH_ON_DELIVERY' && ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'PACKED'].includes(order.orderStatus)
                      return paid || codEligible ? sum + Number(order.total || 0) : sum
                    }, 0)

                    return (
                      <tr
                        key={customer.id}
                        data-customer-row
                        data-name={customer.name || ''}
                        data-email={customer.email || ''}
                        className="border-b border-border transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {customer.image ? (
                                <img src={customer.image} alt={customer.name || 'Customer'} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                getInitials(customer.name)
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{customer.name || 'Unnamed Customer'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{customer.email}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{customer.phone || 'Not provided'}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(customer.createdAt)}</td>
                        <td className="px-4 py-4 text-sm font-medium text-foreground">{orderCount}</td>
                        <td className="px-4 py-4 text-sm font-medium text-primary">{formatCurrency(totalSpent)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${orderCount > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {orderCount > 0 ? 'Active' : 'No Orders'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            data-customer-detail={customer.id}
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr id="customer-empty-state">
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          <SearchX className="h-8 w-8" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">No customers found.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {customerData.length > 0 && (
                  <tr id="customer-filter-empty-state" className="hidden">
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          <SearchX className="h-8 w-8" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">No customers found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {customerData.length > 0 && (
            <div className="flex items-center justify-between border-t border-border bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
              <p id="customer-page-info" className="text-sm text-muted-foreground">Showing 1 to {Math.min(customerData.length, 10)} of {customerData.length}</p>
              <div className="flex items-center gap-2">
                <button id="customer-prev" type="button" className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900">
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button id="customer-next" type="button" className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="customer-detail-panel" role="presentation" className="pointer-events-none fixed inset-0 z-50 flex justify-end bg-slate-950/60 opacity-0 transition-opacity duration-200" aria-hidden="true">
        <div role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="flex h-full w-full max-w-2xl translate-x-full flex-col overflow-y-auto bg-white transition-transform duration-300 ease-out dark:bg-slate-900 sm:translate-x-0">
          {customerData.map((customer) => (
            <div key={customer.id} id={`customer-detail-${customer.id}`} data-detail-panel className="hidden h-full w-full">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 id="customer-detail-title" className="text-xl font-semibold text-foreground">Customer Details</h2>
                  <p className="text-sm text-muted-foreground">Account overview and order history</p>
                </div>
                <button data-customer-detail-close type="button" aria-label="Close customer details" className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary">
                  Close
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="rounded-xl border border-border bg-slate-50 p-5 dark:bg-slate-800/70">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                      {customer.image ? (
                        <img src={customer.image} alt={customer.name || 'Customer'} className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        getInitials(customer.name)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{customer.name || 'Unnamed Customer'}</h3>
                      <p className="text-sm text-muted-foreground">Customer ID: {customer.id}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{customer.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Joined {formatDate(customer.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 dark:bg-slate-900">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{customer.orders.length > 0 ? 'Active customer' : 'No orders yet'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-white p-4 dark:bg-slate-800/70">
                    <h4 className="mb-3 text-base font-semibold text-foreground">Saved Addresses</h4>
                    <div className="space-y-3">
                      {customer.addresses.length > 0 ? (
                        customer.addresses.map((address) => (
                          <div key={address.id} className={`rounded-lg border p-3 ${address.isDefault ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-border bg-slate-50 dark:bg-slate-900'}`}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-foreground">{address.type}</span>
                              {address.isDefault && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{address.fullName}</p>
                            <p className="text-sm text-muted-foreground">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                            <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.postalCode}</p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No saved addresses</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-white p-4 dark:bg-slate-800/70">
                    <h4 className="mb-3 text-base font-semibold text-foreground">Order Statistics</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Total Orders', value: customer.orders.length },
                        { label: 'Completed Orders', value: customer.orders.filter((order) => order.orderStatus === 'DELIVERED').length },
                        { label: 'Pending Orders', value: customer.orders.filter((order) => order.orderStatus === 'PENDING').length },
                        { label: 'Cancelled Orders', value: customer.orders.filter((order) => order.orderStatus === 'CANCELLED').length },
                        {
                          label: 'Total Spent',
                          value: formatCurrency(customer.orders.reduce((sum, order) => {
                            const paid = ['PAID', 'COMPLETED', 'CAPTURED'].includes(order.paymentStatus)
                            const codEligible = order.paymentMethod === 'CASH_ON_DELIVERY' && ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'PACKED'].includes(order.orderStatus)
                            return paid || codEligible ? sum + Number(order.total || 0) : sum
                          }, 0)),
                        },
                      ].map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                          <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4 dark:bg-slate-800/70">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold text-foreground">Recent Orders</h4>
                    <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      View All Orders
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {customer.orders.length > 0 ? (
                    <div className="space-y-3">
                      {customer.orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex flex-col gap-3 rounded-lg border border-border bg-slate-50 p-3 md:flex-row md:items-center md:justify-between dark:bg-slate-900">
                          <div>
                            <p className="font-medium text-foreground">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{formatCurrency(Number(order.total || 0))}</span>
                            <span className="text-sm text-muted-foreground">{order.paymentMethod}</span>
                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getPaymentStatusStyles(order.paymentStatus)}`}>{order.paymentStatus}</span>
                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getOrderStatusStyles(order.orderStatus)}`}>{order.orderStatus}</span>
                          </div>
                          <button type="button" className="inline-flex items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary dark:bg-slate-800">
                            View Order
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No orders available for this customer.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: searchScript }} />
    </main>
  )
}
