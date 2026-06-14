import { Role, LandingStatus, InvoiceStatus } from "@prisma/client"

export type { Role, LandingStatus, InvoiceStatus }

declare module "next-auth" {
  interface User {
    role?: string
  }

  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
