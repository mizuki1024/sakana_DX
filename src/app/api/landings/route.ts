import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { landingSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const landings = await prisma.landing.findMany({
      include: {
        supplier: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(landings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch landings" },
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
    const validatedData = landingSchema.parse(body)

    // Retry logic for handling race conditions on lot number generation
    const maxRetries = 3
    let retryCount = 0
    let landing = null

    while (retryCount < maxRetries) {
      try {
        landing = await prisma.$transaction(async (tx) => {
          // Generate lot number if not provided: LOT-YYYYMMDD-XXX
          let lotNumber = validatedData.lotNumber
          if (!lotNumber) {
            const landingDate = new Date(validatedData.date)
            const dateStr = landingDate.toISOString().slice(0, 10).replace(/-/g, '')
            const todayCount = await tx.landing.count({
              where: {
                date: {
                  gte: new Date(landingDate.setHours(0, 0, 0, 0)),
                  lt: new Date(landingDate.setHours(23, 59, 59, 999)),
                },
              },
            })
            const sequence = String(todayCount + 1).padStart(3, '0')
            lotNumber = `LOT-${dateStr}-${sequence}`
          }

          return await tx.landing.create({
            data: {
              date: new Date(validatedData.date),
              supplierId: validatedData.supplierId,
              fishType: validatedData.fishType,
              lotNumber,
              weight: typeof validatedData.weight === 'number'
                ? validatedData.weight
                : parseFloat(validatedData.weight),
              grade: validatedData.grade || null,
              storageLocation: validatedData.storageLocation || null,
            },
          })
        })

        // Success - break out of retry loop
        break
      } catch (error: any) {
        // Check if it's a unique constraint violation on lotNumber
        if (error.code === 'P2002' && error.meta?.target?.includes('lotNumber')) {
          retryCount++
          if (retryCount >= maxRetries) {
            throw new Error("Failed to generate unique lot number after multiple attempts")
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          // For other errors, throw immediately
          throw error
        }
      }
    }

    return NextResponse.json(landing, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create landing" },
      { status: 500 }
    )
  }
}
