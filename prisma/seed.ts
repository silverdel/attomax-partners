import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample partners
  const partner1 = await prisma.partner.create({
    data: {
      name: 'Pro Golf Miami',
      email: 'info@progolfmiami.com',
      domain: 'progolfmiami.com',
      brandName: 'Pro Golf Miami',
      commissionRate: 15.00,
      status: 'ACTIVE',
      shopifyTag: 'partner_progolf_miami',
    },
  })

  const partner2 = await prisma.partner.create({
    data: {
      name: 'Golf Central',
      email: 'sales@golfcentral.com',
      domain: 'golfcentral.com',
      brandName: 'Golf Central',
      commissionRate: 12.50,
      status: 'PENDING',
      shopifyTag: 'partner_golf_central',
    },
  })

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      shopifyProductId: 'gid://shopify/Product/7234567890123',
      title: 'ATTOMAX Golf Ball - Premium White',
      description: 'Premium golf balls with advanced aerodynamics',
      price: 49.99,
      imageUrl: 'https://example.com/attomax-white.jpg',
      status: 'ACTIVE',
    },
  })

  const product2 = await prisma.product.create({
    data: {
      shopifyProductId: 'gid://shopify/Product/7234567890124',
      title: 'ATTOMAX Golf Ball - Tournament Yellow',
      description: 'High-visibility tournament grade golf balls',
      price: 54.99,
      imageUrl: 'https://example.com/attomax-yellow.jpg',
      status: 'ACTIVE',
    },
  })

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      shopifyOrderId: '#1001',
      partnerId: partner1.id,
      customerEmail: 'customer1@example.com',
      totalAmount: 99.98,
      commissionAmount: 14.99,
      commissionStatus: 'PENDING',
      orderStatus: 'completed',
    },
  })

  const order2 = await prisma.order.create({
    data: {
      shopifyOrderId: '#1002',
      partnerId: partner1.id,
      customerEmail: 'customer2@example.com',
      totalAmount: 54.99,
      commissionAmount: 8.25,
      commissionStatus: 'PAID',
      orderStatus: 'completed',
    },
  })

  // Create sample commission payment
  const commissionPayment = await prisma.commissionPayment.create({
    data: {
      partnerId: partner1.id,
      amount: 8.25,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      paymentDate: new Date('2024-02-01'),
      paymentMethod: 'Bank Transfer',
      status: 'PAID',
    },
  })

  console.log('Database seeded successfully!')
  console.log({
    partners: 2,
    products: 2,
    orders: 2,
    commissionPayments: 1,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })