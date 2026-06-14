import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supplierSchema } from "@/lib/validations"
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

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json(supplier)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
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
    const validatedData = supplierSchema.parse(body)

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        code: validatedData.code,
        contact: validatedData.contact || null,
      },
    })

    return NextResponse.json(supplier)
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
      { error: "Failed to update supplier" },
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

    // Check if supplier has related landings
    const landingsCount = await prisma.landing.count({
      where: { supplierId: params.id },
    })

    if (landingsCount > 0) {
      return NextResponse.json(
        { error: "この仕入先には水揚げデータが存在するため削除できません" },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    )
  }
}
