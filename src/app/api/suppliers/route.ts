import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supplierSchema } from "@/lib/validations"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
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
    const validatedData = supplierSchema.parse(body)

    const supplier = await prisma.supplier.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        contact: validatedData.contact || null,
      },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "このコードは既に使用されています" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    )
  }
}
