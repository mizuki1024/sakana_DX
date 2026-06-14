import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invoiceSchema } from "@/lib/validations"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        buyer: true,
        _count: {
          select: { sales: true },
        },
      },
      orderBy: [
        { month: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Check if invoice already exists for this buyer and month
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        buyerId: validatedData.buyerId,
        month: validatedData.month,
      },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: "この買受人の対象月の請求書は既に作成されています" },
        { status: 400 }
      )
    }

    // Find all uninvoiced sales for this buyer in the target month
    const startDate = new Date(`${validatedData.month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const eligibleSales = await prisma.sale.findMany({
      where: {
        buyerId: validatedData.buyerId,
        invoiceId: null,
        saleDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    })

    if (eligibleSales.length === 0) {
      return NextResponse.json(
        { error: "この買受人の対象月に未請求の売上がありません" },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = eligibleSales.reduce((sum, sale) => sum + sale.price, 0)

    // Create invoice and link sales in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const newInvoice = await tx.invoice.create({
        data: {
          buyerId: validatedData.buyerId,
          month: validatedData.month,
          totalAmount,
          status: "DRAFT",
        },
      })

      // Link sales to invoice
      await tx.sale.updateMany({
        where: {
          id: { in: eligibleSales.map((s) => s.id) },
        },
        data: {
          invoiceId: newInvoice.id,
        },
      })

      // Update landing status to INVOICED
      const landingIds = Array.from(new Set(eligibleSales.map((s) => s.landingId)))
      await tx.landing.updateMany({
        where: {
          id: { in: landingIds },
        },
        data: {
          status: "INVOICED",
        },
      })

      return newInvoice
    })

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      entityType: "Invoice",
      entityId: invoice.id,
      newValue: {
        buyerId: validatedData.buyerId,
        month: validatedData.month,
        totalAmount,
        salesCount: eligibleSales.length,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    )
  }
}
