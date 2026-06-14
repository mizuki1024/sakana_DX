import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buyerSchema } from "@/lib/validations"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { canDeleteRecords } from "@/lib/permissions"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id },
    })

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    }

    return NextResponse.json(buyer)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch buyer" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = buyerSchema.parse(body)

    const buyer = await prisma.buyer.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        code: validatedData.code,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
      },
    })

    return NextResponse.json(buyer)
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
      { error: "Failed to update buyer" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN can delete records
    const role = session.user?.role as "ADMIN" | "STAFF" | "BUYER" | null
    if (!canDeleteRecords(role)) {
      return NextResponse.json({ error: "削除には管理者権限が必要です" }, { status: 403 })
    }

    // Check if buyer has related sales
    const salesCount = await prisma.sale.count({
      where: { buyerId: params.id },
    })

    if (salesCount > 0) {
      return NextResponse.json(
        { error: "この買受人には売上データが存在するため削除できません" },
        { status: 400 }
      )
    }

    await prisma.buyer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete buyer" },
      { status: 500 }
    )
  }
}
