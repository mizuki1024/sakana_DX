import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
