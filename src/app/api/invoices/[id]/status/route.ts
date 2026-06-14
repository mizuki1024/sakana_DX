import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"

const statusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID"]),
})

// Valid status transitions
const validTransitions: Record<string, string[]> = {
  DRAFT: ["SENT"],
  SENT: ["PAID", "DRAFT"], // Allow reverting to DRAFT
  PAID: [], // Cannot change from PAID
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status: newStatus } = statusSchema.parse(body)

    // Get current invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Check if transition is valid
    const allowedStatuses = validTransitions[invoice.status]
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `ステータスを${invoice.status}から${newStatus}に変更できません`,
        },
        { status: 400 }
      )
    }

    const oldStatus = invoice.status

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: { buyer: true },
    })

    // Create audit log
    await createAuditLog({
      action: "STATUS_CHANGE",
      entityType: "Invoice",
      entityId: params.id,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update invoice status" },
      { status: 500 }
    )
  }
}
