import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export type Role = "ADMIN" | "STAFF" | "BUYER"

export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) {
    return null
  }
  return session.user.role as Role
}

export async function requireAuth(): Promise<{ email: string; role: Role }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }
  return {
    email: session.user.email,
    role: (session.user.role as Role) || "STAFF",
  }
}

export async function requireAdmin(): Promise<{ email: string; role: Role }> {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required")
  }
  return user
}

export function canAccessAdminFeatures(role: Role | null): boolean {
  return role === "ADMIN"
}

export function canEditMasterData(role: Role | null): boolean {
  return role === "ADMIN" || role === "STAFF"
}

export function canViewAuditLogs(role: Role | null): boolean {
  return role === "ADMIN"
}

export function canChangeInvoiceStatus(role: Role | null): boolean {
  return role === "ADMIN" || role === "STAFF"
}

export function canDeleteRecords(role: Role | null): boolean {
  return role === "ADMIN"
}
