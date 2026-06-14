import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '管理者',
      role: 'ADMIN',
    },
  })
  console.log(`Created user: ${user.email}`)

  // Create sample suppliers
  const suppliers = [
    { name: '山田水産', code: 'SUP-001', contact: '090-1234-5678' },
    { name: '鈴木漁業', code: 'SUP-002', contact: '090-2345-6789' },
    { name: '佐藤海運', code: 'SUP-003', contact: '090-3456-7890' },
  ]

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { code: supplier.code },
      update: {},
      create: supplier,
    })
    console.log(`Created supplier: ${supplier.name}`)
  }

  // Create sample buyers
  const buyers = [
    { name: '東京水産市場', code: 'BUY-001', email: 'tokyo@example.com', phone: '03-1234-5678' },
    { name: '大阪鮮魚店', code: 'BUY-002', email: 'osaka@example.com', phone: '06-2345-6789' },
    { name: '福岡魚問屋', code: 'BUY-003', email: 'fukuoka@example.com', phone: '092-3456-7890' },
  ]

  for (const buyer of buyers) {
    await prisma.buyer.upsert({
      where: { code: buyer.code },
      update: {},
      create: buyer,
    })
    console.log(`Created buyer: ${buyer.name}`)
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
