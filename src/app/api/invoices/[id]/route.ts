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

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        buyer: true,
        sales: {
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
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    )
  }
}
