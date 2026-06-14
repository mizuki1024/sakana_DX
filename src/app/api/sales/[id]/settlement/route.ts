import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        landing: {
          include: {
            supplier: true,
          },
        },
        buyer: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Calculate settlement data
    const settlementData = {
      saleId: sale.id,
      saleDate: sale.saleDate,
      lotNumber: sale.landing.lotNumber,
      fishType: sale.landing.fishType,
      weight: sale.landing.weight,
      grade: sale.landing.grade,
      supplier: {
        name: sale.landing.supplier.name,
        code: sale.landing.supplier.code,
      },
      buyer: {
        name: sale.buyer.name,
        code: sale.buyer.code,
      },
      price: sale.price,
      // Commission calculation (example: 5%)
      commission: sale.price * 0.05,
      netAmount: sale.price * 0.95,
    }

    return NextResponse.json(settlementData)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settlement data" },
      { status: 500 }
    )
  }
}
