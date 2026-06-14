import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExportButton } from "@/components/export-button"
import { LandingsTable } from "./landings-table"

const statusLabels: Record<string, string> = {
  LANDED: "水揚げ済み",
  SOLD: "販売済み",
  INVOICED: "請求済み",
}

export default async function LandingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const landings = await prisma.landing.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  const formattedLandings = landings.map((landing) => ({
    id: landing.id,
    date: new Date(landing.date).toLocaleDateString("ja-JP"),
    lotNumber: landing.lotNumber,
    supplierName: landing.supplier.name,
    fishType: landing.fishType,
    weight: landing.weight.toFixed(1),
    grade: landing.grade || "-",
    status: statusLabels[landing.status] || landing.status,
  }))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">水揚げ管理</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">水揚げ情報の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          <ExportButton endpoint="/api/landings/export" />
          <Link href="/landings/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">水揚げ一覧</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <LandingsTable data={formattedLandings} />
        </CardContent>
      </Card>
    </div>
  )
}
