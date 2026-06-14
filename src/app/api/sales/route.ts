import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saleSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sales = await prisma.sale.findMany({
      include: {
        landing: {
          include: {
            supplier: true,
          },
        },
        buyer: true,
      },
      orderBy: {
        saleDate: "desc",
      },
    })

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sales" },
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

    // Validate input
    const validatedData = saleSchema.parse(body)

    // Create sale and update landing status in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Check landing status first
      const landing = await tx.landing.findUnique({
        where: { id: validatedData.landingId },
        select: { status: true },
      })

      if (!landing) {
        throw new Error("Landing not found")
      }

      if (landing.status === "SOLD") {
        throw new Error("This landing has already been sold")
      }

      if (landing.status === "INVOICED") {
        throw new Error("This landing has already been invoiced")
      }

      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          landingId: validatedData.landingId,
          buyerId: validatedData.buyerId,
          price: typeof validatedData.price === 'number'
            ? validatedData.price
            : parseFloat(validatedData.price),
        },
        include: {
          landing: {
            include: {
              supplier: true,
            },
          },
          buyer: true,
        },
      })

      // Update landing status to SOLD
      await tx.landing.update({
        where: { id: validatedData.landingId },
        data: { status: "SOLD" },
      })

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create sale" },
      { status: 500 }
    )
  }
}
