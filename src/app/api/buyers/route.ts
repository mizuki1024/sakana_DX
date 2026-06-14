import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buyerSchema } from "@/lib/validations"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const buyers = await prisma.buyer.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(buyers)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch buyers" },
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
    const validatedData = buyerSchema.parse(body)

    const buyer = await prisma.buyer.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
      },
    })

    return NextResponse.json(buyer, { status: 201 })
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
      { error: "Failed to create buyer" },
      { status: 500 }
    )
  }
}
