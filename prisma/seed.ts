import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Fruits',
    slug: 'fruits',
    icon: 'Apple',
    description: 'Fresh and delicious fruits',
  },
  {
    name: 'Vegetables',
    slug: 'vegetables',
    icon: 'Carrot',
    description: 'Fresh and organic vegetables',
  },
  {
    name: 'Dairy',
    slug: 'dairy',
    icon: 'Milk',
    description: 'Milk, cheese, butter and more',
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    icon: 'Croissant',
    description: 'Fresh bread and baked goods',
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    icon: 'Coffee',
    description: 'Tea, coffee, juices and more',
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    icon: 'Cookie',
    description: 'Chips, biscuits, and snacks',
  },
  {
    name: 'Frozen Foods',
    slug: 'frozen-foods',
    icon: 'Snowflake',
    description: 'Frozen vegetables and meals',
  },
  {
    name: 'Organic',
    slug: 'organic',
    icon: 'Leaf',
    description: '100% organic products',
  },
  {
    name: 'Household Items',
    slug: 'household-items',
    icon: 'Home',
    description: 'Cleaning and household items',
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    icon: 'Smile',
    description: 'Personal hygiene products',
  },
]

const products = [
  // Fruits
  {
    name: 'Fresh Apple',
    slug: 'fresh-apple',
    description: 'Crispy and sweet red apples from premium farms',
    price: 120,
    discountPrice: 99,
    discount: 18,
    categorySlug: 'fruits',
    sku: 'FRUIT001',
    stock: 100,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1560806e614371-d3f0c7f44f15?w=500'],
    rating: 4.5,
    reviewCount: 125,
    isFeatured: true,
  },
  {
    name: 'Ripe Bananas',
    slug: 'ripe-bananas',
    description: 'Sweet and creamy ripe bananas, perfect for breakfast',
    price: 80,
    discountPrice: 60,
    discount: 25,
    categorySlug: 'fruits',
    sku: 'FRUIT002',
    stock: 150,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'],
    rating: 4.7,
    reviewCount: 89,
    isFeatured: true,
  },
  {
    name: 'Fresh Oranges',
    slug: 'fresh-oranges',
    description: 'Juicy and vitamin-rich oranges',
    price: 150,
    discountPrice: 120,
    discount: 20,
    categorySlug: 'fruits',
    sku: 'FRUIT003',
    stock: 80,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1587735639519-e21cc028cb29?w=500'],
    rating: 4.6,
    reviewCount: 76,
    isFeatured: false,
  },
  {
    name: 'Sweet Mangoes',
    slug: 'sweet-mangoes',
    description: 'Premium quality mangoes with natural sweetness',
    price: 200,
    discountPrice: 160,
    discount: 20,
    categorySlug: 'fruits',
    sku: 'FRUIT004',
    stock: 60,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500'],
    rating: 4.8,
    reviewCount: 94,
    isFeatured: true,
  },
  {
    name: 'Watermelons',
    slug: 'watermelons',
    description: 'Large and refreshing watermelons',
    price: 250,
    discountPrice: 199,
    discount: 20,
    categorySlug: 'fruits',
    sku: 'FRUIT005',
    stock: 45,
    weight: 5,
    images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500'],
    rating: 4.4,
    reviewCount: 58,
    isFeatured: false,
  },

  // Vegetables
  {
    name: 'Fresh Tomatoes',
    slug: 'fresh-tomatoes',
    description: 'Ripe and juicy tomatoes for your kitchen',
    price: 60,
    discountPrice: 45,
    discount: 25,
    categorySlug: 'vegetables',
    sku: 'VEG001',
    stock: 120,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500'],
    rating: 4.3,
    reviewCount: 102,
    isFeatured: true,
  },
  {
    name: 'Potatoes',
    slug: 'potatoes',
    description: 'High-quality potatoes for all your cooking needs',
    price: 40,
    discountPrice: 30,
    discount: 25,
    categorySlug: 'vegetables',
    sku: 'VEG002',
    stock: 200,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1585591446034-7ea2efed4c0c?w=500'],
    rating: 4.2,
    reviewCount: 78,
    isFeatured: false,
  },
  {
    name: 'Red Onions',
    slug: 'red-onions',
    description: 'Fresh red onions with strong flavor',
    price: 50,
    discountPrice: 40,
    discount: 20,
    categorySlug: 'vegetables',
    sku: 'VEG003',
    stock: 150,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1587049262062-ae96ff7f1bda?w=500'],
    rating: 4.1,
    reviewCount: 65,
    isFeatured: false,
  },
  {
    name: 'Fresh Carrots',
    slug: 'fresh-carrots',
    description: 'Crunchy and sweet carrots',
    price: 70,
    discountPrice: 55,
    discount: 21,
    categorySlug: 'vegetables',
    sku: 'VEG004',
    stock: 130,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1590080876-ce5a0ca76f61?w=500'],
    rating: 4.4,
    reviewCount: 88,
    isFeatured: true,
  },
  {
    name: 'Spinach Leaves',
    slug: 'spinach-leaves',
    description: 'Fresh and nutrient-rich spinach leaves',
    price: 80,
    discountPrice: 65,
    discount: 19,
    categorySlug: 'vegetables',
    sku: 'VEG005',
    stock: 90,
    weight: 0.5,
    images: ['https://images.unsplash.com/photo-1599599810694-b308ca884cb4?w=500'],
    rating: 4.5,
    reviewCount: 72,
    isFeatured: false,
  },

  // Dairy
  {
    name: 'Fresh Milk 1L',
    slug: 'fresh-milk-1l',
    description: 'Fresh pasteurized whole milk',
    price: 70,
    discountPrice: 65,
    discount: 7,
    categorySlug: 'dairy',
    sku: 'DAIRY001',
    stock: 200,
    weight: 1,
    images: ['https://images.unsplash.com/photo-1585066894330-e65407b1eaba?w=500'],
    rating: 4.6,
    reviewCount: 156,
    isFeatured: true,
  },
  {
    name: 'Cheddar Cheese',
    slug: 'cheddar-cheese',
    description: 'Premium aged cheddar cheese',
    price: 320,
    discountPrice: 280,
    discount: 13,
    categorySlug: 'dairy',
    sku: 'DAIRY002',
    stock: 50,
    weight: 0.5,
    images: ['https://images.unsplash.com/photo-1624437894929-b1e0fdf60ebe?w=500'],
    rating: 4.7,
    reviewCount: 98,
    isFeatured: true,
  },
  {
    name: 'Butter 500g',
    slug: 'butter-500g',
    description: 'Pure butter for cooking and spreading',
    price: 180,
    discountPrice: 160,
    discount: 11,
    categorySlug: 'dairy',
    sku: 'DAIRY003',
    stock: 80,
    weight: 0.5,
    images: ['https://images.unsplash.com/photo-1630000763202-4e97a3d1d88c?w=500'],
    rating: 4.5,
    reviewCount: 84,
    isFeatured: false,
  },
  {
    name: 'Greek Yogurt 500g',
    slug: 'greek-yogurt-500g',
    description: 'Thick and creamy Greek yogurt',
    price: 120,
    discountPrice: 99,
    discount: 18,
    categorySlug: 'dairy',
    sku: 'DAIRY004',
    stock: 100,
    weight: 0.5,
    images: ['https://images.unsplash.com/photo-1488477066519-51a339d202d5?w=500'],
    rating: 4.4,
    reviewCount: 77,
    isFeatured: true,
  },

  // Bakery
  {
    name: 'Wheat Bread',
    slug: 'wheat-bread',
    description: 'Fresh whole wheat bread',
    price: 60,
    discountPrice: 50,
    discount: 17,
    categorySlug: 'bakery',
    sku: 'BAKE001',
    stock: 80,
    weight: 0.5,
    images: ['https://images.unsplash.com/photo-1626065299294-ddc100fc801e?w=500'],
    rating: 4.3,
    reviewCount: 92,
    isFeatured: false,
  },
  {
    name: 'Croissants (Pack of 4)',
    slug: 'croissants-pack-of-4',
    description: 'Buttery and flaky croissants',
    price: 180,
    discountPrice: 150,
    discount: 17,
    categorySlug: 'bakery',
    sku: 'BAKE002',
    stock: 60,
    weight: 0.4,
    images: ['https://images.unsplash.com/photo-1585647347384-9e1e5a6edf0a?w=500'],
    rating: 4.6,
    reviewCount: 68,
    isFeatured: true,
  },

  // Beverages
  {
    name: 'Coffee Beans 500g',
    slug: 'coffee-beans-500g',
    description: 'Premium arabica coffee beans',
    price: 450,
    discountPrice: 380,
    discount: 16,
    categorySlug: 'beverages',
    sku: 'BEV001',
    stock: 70,
    weight: 0.5,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=500'],
    rating: 4.7,
    reviewCount: 134,
    isFeatured: true,
  },
  {
    name: 'Green Tea Pack',
    slug: 'green-tea-pack',
    description: 'Organic green tea bags',
    price: 120,
    discountPrice: 99,
    discount: 18,
    categorySlug: 'beverages',
    sku: 'BEV002',
    stock: 100,
    weight: 0.2,
    images: ['https://images.unsplash.com/photo-1597318972826-22a822eac34c?w=500'],
    rating: 4.5,
    reviewCount: 81,
    isFeatured: false,
  },

  // Snacks
  {
    name: 'Potato Chips 100g',
    slug: 'potato-chips-100g',
    description: 'Crispy potato chips with salt flavor',
    price: 40,
    discountPrice: 35,
    discount: 12,
    categorySlug: 'snacks',
    sku: 'SNACK001',
    stock: 150,
    weight: 0.1,
    images: ['https://images.unsplash.com/photo-1599599810694-b308ca884cb4?w=500'],
    rating: 4.2,
    reviewCount: 102,
    isFeatured: false,
  },
  {
    name: 'Chocolate Biscuits',
    slug: 'chocolate-biscuits',
    description: 'Delicious chocolate biscuits',
    price: 80,
    discountPrice: 65,
    discount: 19,
    categorySlug: 'snacks',
    sku: 'SNACK002',
    stock: 120,
    weight: 0.2,
    images: ['https://images.unsplash.com/photo-1599599810694-b308ca884cb4?w=500'],
    rating: 4.4,
    reviewCount: 76,
    isFeatured: true,
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.wishlist.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.cartItem.deleteMany({})
  await prisma.cart.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.address.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})

  // Create Categories
  console.log('📁 Creating categories...')
  const categoryRecords = await Promise.all(
    categories.map((cat) =>
      prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
        },
      })
    )
  )
  console.log(`✅ Created ${categoryRecords.length} categories`)

  // Create Products
  console.log('🍎 Creating products...')
  const categoryMap = categoryRecords.reduce(
    (acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    },
    {} as Record<string, string>
  )

  const productRecords = await Promise.all(
    products.map((prod) =>
      prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          discountPrice: prod.discountPrice,
          discount: prod.discount,
          categoryId: categoryMap[prod.categorySlug],
          sku: prod.sku,
          stock: prod.stock,
          weight: prod.weight,
          images: prod.images,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          isFeatured: prod.isFeatured,
        },
      })
    )
  )
  console.log(`✅ Created ${productRecords.length} products`)

  // Create Test Users
  console.log('👥 Creating test users...')
  const hashedPassword = await bcrypt.hash('Password@123', 10)

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@grocery.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+91-9999999999',
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'customer@grocery.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: '+91-8888888888',
    },
  })

  const customerUser2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@grocery.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: '+91-7777777777',
    },
  })

  console.log(`✅ Created 3 test users`)

  // Create Addresses
  console.log('📍 Creating addresses...')
  const address1 = await prisma.address.create({
    data: {
      userId: customerUser.id,
      type: 'HOME',
      fullName: 'John Doe',
      phone: '+91-8888888888',
      email: 'customer@grocery.com',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      isDefault: true,
    },
  })

  const address2 = await prisma.address.create({
    data: {
      userId: customerUser2.id,
      type: 'WORK',
      fullName: 'Jane Smith',
      phone: '+91-7777777777',
      email: 'jane@grocery.com',
      addressLine1: '456 Business Park',
      addressLine2: 'Floor 5',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      isDefault: true,
    },
  })

  console.log(`✅ Created 2 addresses`)

  // Create Sample Orders
  console.log('📦 Creating sample orders...')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  for (let i = 0; i < 10; i++) {
    const randomProducts = productRecords
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1)

    const orderItems = randomProducts.map((product) => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: product.discountPrice || product.price,
      discount: product.discount || 0,
      total:
        ((product.discountPrice || product.price) *
          (Math.floor(Math.random() * 3) + 1)) /
        1,
    }))

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
    const shippingCharge = subtotal > 500 ? 0 : 50
    const tax = Math.round(subtotal * 0.05 * 100) / 100
    const total = subtotal + shippingCharge + tax

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}-${i}`,
        userId: i % 2 === 0 ? customerUser.id : customerUser2.id,
        subtotal,
        shippingCharge,
        tax,
        discount: 0,
        total,
        shippingAddressId: i % 2 === 0 ? address1.id : address2.id,
        billingAddressId: i % 2 === 0 ? address1.id : address2.id,
        paymentMethod: ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH_ON_DELIVERY'][
          Math.floor(Math.random() * 4)
        ] as any,
        paymentStatus: ['PENDING', 'COMPLETED', 'FAILED'][
          Math.floor(Math.random() * 3)
        ] as any,
        orderStatus: [
          'PENDING',
          'PROCESSING',
          'CONFIRMED',
          'PACKED',
          'SHIPPED',
          'DELIVERED',
        ][Math.floor(Math.random() * 6)] as any,
        trackingNumber: `TRACK-${Math.random().toString(36).substring(7).toUpperCase()}`,
        estimatedDelivery:
          Math.random() > 0.5
            ? new Date(tomorrow)
            : new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        items: {
          create: orderItems,
        },
      },
    })
  }

  console.log(`✅ Created 10 sample orders`)

  // Create Reviews
  console.log('⭐ Creating product reviews...')
  for (let i = 0; i < 15; i++) {
    const randomProduct =
      productRecords[Math.floor(Math.random() * productRecords.length)]
    const randomUser = [customerUser, customerUser2][
      Math.floor(Math.random() * 2)
    ]

    try {
      await prisma.review.create({
        data: {
          productId: randomProduct.id,
          userId: randomUser.id,
          rating: Math.floor(Math.random() * 5) + 1,
          title: `Great product!`,
          comment: `This is an excellent product. Highly recommended.`,
        },
      })
    } catch (err) {
      // Skip if unique constraint fails
    }
  }

  console.log(`✅ Created product reviews`)

  // Create Wishlist items
  console.log('❤️ Creating wishlist items...')
  for (let i = 0; i < 5; i++) {
    const randomProduct =
      productRecords[Math.floor(Math.random() * productRecords.length)]

    try {
      await prisma.wishlist.create({
        data: {
          userId: customerUser.id,
          productId: randomProduct.id,
        },
      })
    } catch (err) {
      // Skip if unique constraint fails
    }
  }

  console.log(`✅ Created wishlist items`)

  // Create Cart
  console.log('🛒 Creating shopping carts...')
  const cart = await prisma.cart.create({
    data: {
      userId: customerUser.id,
    },
  })

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: productRecords[0].id,
      quantity: 2,
    },
  })

  console.log(`✅ Created shopping carts`)

  console.log('✨ Database seed completed successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('Admin - email: admin@grocery.com | password: Password@123')
  console.log('Customer 1 - email: customer@grocery.com | password: Password@123')
  console.log('Customer 2 - email: jane@grocery.com | password: Password@123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
