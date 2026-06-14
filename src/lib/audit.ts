import { prisma } from "./prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE"
type EntityType = "Invoice" | "Sale" | "Landing" | "Buyer" | "Supplier"

interface AuditLogParams {
  action: AuditAction
  entityType: EntityType
  entityId: string
  oldValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
}

export async function createAuditLog({
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
}: AuditLogParams): Promise<void> {
  try {
    const session = await getServerSession(authOptions)

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.email || null,
        userEmail: session?.user?.email || null,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should not break main operations
    console.error("Failed to create audit log:", error)
  }
}

export async function getAuditLogs(
  entityType?: EntityType,
  entityId?: string,
  limit = 100
) {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })
}
