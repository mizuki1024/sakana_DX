import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const buyerId = searchParams.get("buyerId")
    const month = searchParams.get("month")

    if (!buyerId || !month) {
      return NextResponse.json(
        { error: "buyerId and month are required" },
        { status: 400 }
      )
    }

    // Find all uninvoiced sales for this buyer in the target month
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const sales = await prisma.sale.findMany({
      where: {
        buyerId,
        invoiceId: null,
        saleDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        landing: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: {
        saleDate: "asc",
      },
    })

    const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0)

    return NextResponse.json({
      sales,
      totalAmount,
      count: sales.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    )
  }
}
