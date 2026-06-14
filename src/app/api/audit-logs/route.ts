import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canViewAuditLogs } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN can view audit logs
    const role = session.user?.role as "ADMIN" | "STAFF" | "BUYER" | null
    if (!canViewAuditLogs(role)) {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const limit = parseInt(searchParams.get("limit") || "100")

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}
