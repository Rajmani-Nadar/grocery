import { prisma } from './src/lib/prisma.ts'

async function activateAllProducts() {
  try {
    const result = await prisma.product.updateMany({
      where: { isActive: false },
      data: { isActive: true }
    })
    console.log('Activated', result.count, 'products')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateAllProducts()
