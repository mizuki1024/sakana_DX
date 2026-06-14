import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '管理者',
      role: 'ADMIN',
    },
  })
  console.log(`Created user: ${adminUser.email} (ADMIN)`)

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: hashedPassword,
      name: 'スタッフ',
      role: 'STAFF',
    },
  })
  console.log(`Created user: ${staffUser.email} (STAFF)`)

  // Create sample suppliers
  const supplierData = [
    { name: '山田水産', code: 'SUP-001', contact: '090-1234-5678' },
    { name: '鈴木漁業', code: 'SUP-002', contact: '090-2345-6789' },
    { name: '佐藤海運', code: 'SUP-003', contact: '090-3456-7890' },
    { name: '田中丸', code: 'SUP-004', contact: '090-4567-8901' },
    { name: '高橋漁船', code: 'SUP-005', contact: '090-5678-9012' },
  ]

  const suppliers = []
  for (const supplier of supplierData) {
    const created = await prisma.supplier.upsert({
      where: { code: supplier.code },
      update: {},
      create: supplier,
    })
    suppliers.push(created)
    console.log(`Created supplier: ${supplier.name}`)
  }

  // Create sample buyers
  const buyerData = [
    { name: '東京水産市場', code: 'BUY-001', email: 'tokyo@example.com', phone: '03-1234-5678' },
    { name: '大阪鮮魚店', code: 'BUY-002', email: 'osaka@example.com', phone: '06-2345-6789' },
    { name: '福岡魚問屋', code: 'BUY-003', email: 'fukuoka@example.com', phone: '092-3456-7890' },
    { name: '札幌海産物', code: 'BUY-004', email: 'sapporo@example.com', phone: '011-4567-8901' },
    { name: '名古屋鮮魚', code: 'BUY-005', email: 'nagoya@example.com', phone: '052-5678-9012' },
  ]

  const buyers = []
  for (const buyer of buyerData) {
    const created = await prisma.buyer.upsert({
      where: { code: buyer.code },
      update: {},
      create: buyer,
    })
    buyers.push(created)
    console.log(`Created buyer: ${buyer.name}`)
  }

  // Create sample landings with various fish types
  const fishTypes = ['マグロ', 'サバ', 'アジ', 'イカ', 'タコ', 'ブリ', 'サーモン', 'エビ']
  const grades = ['A', 'B', 'C']
  const storageLocations = ['冷蔵庫1', '冷蔵庫2', '冷凍庫1', '冷凍庫2']

  // Generate landings for the past 2 months
  const today = new Date()
  const landings = []
  let lotCounter = 1

  for (let daysAgo = 60; daysAgo >= 0; daysAgo -= 3) {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)

    // 2-4 landings per day
    const landingsPerDay = 2 + Math.floor(Math.random() * 3)

    for (let i = 0; i < landingsPerDay; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)]
      const weight = 50 + Math.floor(Math.random() * 450) // 50-500kg
      const grade = grades[Math.floor(Math.random() * grades.length)]
      const storage = storageLocations[Math.floor(Math.random() * storageLocations.length)]

      const lotNumber = `LOT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(lotCounter++).padStart(4, '0')}`

      try {
        const landing = await prisma.landing.create({
          data: {
            date,
            supplierId: supplier.id,
            fishType,
            lotNumber,
            weight,
            grade,
            storageLocation: storage,
            status: 'LANDED',
          },
        })
        landings.push(landing)
      } catch {
        // Skip if lot number already exists
      }
    }
  }
  console.log(`Created ${landings.length} landings`)

  // Create sales for some landings
  const sales = []
  for (const landing of landings) {
    // 70% chance of being sold
    if (Math.random() < 0.7) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)]
      const pricePerKg = 500 + Math.floor(Math.random() * 2500) // 500-3000円/kg
      const price = landing.weight * pricePerKg

      const saleDate = new Date(landing.date)
      saleDate.setDate(saleDate.getDate() + Math.floor(Math.random() * 3)) // Sold within 3 days

      const sale = await prisma.sale.create({
        data: {
          landingId: landing.id,
          buyerId: buyer.id,
          price,
          saleDate,
        },
      })
      sales.push(sale)

      // Update landing status
      await prisma.landing.update({
        where: { id: landing.id },
        data: { status: 'SOLD' },
      })
    }
  }
  console.log(`Created ${sales.length} sales`)

  // Create invoices for last month
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

  const startOfLastMonth = new Date(`${lastMonthStr}-01`)
  const endOfLastMonth = new Date(startOfLastMonth)
  endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1)

  for (const buyer of buyers) {
    // Find sales for this buyer in last month
    const buyerSales = await prisma.sale.findMany({
      where: {
        buyerId: buyer.id,
        invoiceId: null,
        saleDate: {
          gte: startOfLastMonth,
          lt: endOfLastMonth,
        },
      },
    })

    if (buyerSales.length > 0) {
      const totalAmount = buyerSales.reduce((sum, sale) => sum + sale.price, 0)

      const invoice = await prisma.invoice.create({
        data: {
          buyerId: buyer.id,
          month: lastMonthStr,
          totalAmount,
          status: Math.random() < 0.5 ? 'SENT' : 'DRAFT',
        },
      })

      // Link sales to invoice
      await prisma.sale.updateMany({
        where: {
          id: { in: buyerSales.map(s => s.id) },
        },
        data: {
          invoiceId: invoice.id,
        },
      })

      // Update landing status
      const landingIds = Array.from(new Set(buyerSales.map(s => s.landingId)))
      await prisma.landing.updateMany({
        where: {
          id: { in: landingIds },
        },
        data: {
          status: 'INVOICED',
        },
      })

      console.log(`Created invoice for ${buyer.name}: ¥${totalAmount.toLocaleString()}`)
    }
  }

  console.log('Seeding finished.')
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
