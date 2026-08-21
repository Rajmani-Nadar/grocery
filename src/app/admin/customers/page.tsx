import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CustomersClient from './CustomersClient'
import type { CustomerRecord } from './CustomersClient'

export const metadata: Metadata = { title: 'Admin Customers' }

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/auth/login')

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: { addresses: true, orders: { orderBy: { createdAt: 'desc' }, include: { payment: true } } },
  })

  const customerData: CustomerRecord[] = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    image: customer.image,
    createdAt: customer.createdAt.toISOString(),
    addresses: customer.addresses.map((address) => ({
      id: address.id, type: address.type, fullName: address.fullName, phone: address.phone, email: address.email,
      addressLine1: address.addressLine1, addressLine2: address.addressLine2, city: address.city,
      state: address.state, postalCode: address.postalCode, country: address.country, isDefault: address.isDefault,
    })),
    orders: customer.orders.map((order) => ({
      id: order.id, orderNumber: order.orderNumber, total: Number(order.total || 0),
      paymentMethod: order.paymentMethod, paymentStatus: order.payment?.status ?? order.paymentStatus,
      orderStatus: order.orderStatus, createdAt: order.createdAt.toISOString(),
    })),
  }))

  return <CustomersClient customerData={customerData} />
}