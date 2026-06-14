import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExportButton } from "@/components/export-button"

const statusLabels = {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">水揚げ管理</h1>
          <p className="mt-2 text-gray-600">水揚げ情報の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          <ExportButton endpoint="/api/landings/export" />
          <Link href="/landings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>水揚げ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>ロット番号</TableHead>
                <TableHead>仕入先</TableHead>
                <TableHead>魚種</TableHead>
                <TableHead>重量 (kg)</TableHead>
                <TableHead>等級</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    水揚げデータがありません
                  </TableCell>
                </TableRow>
              ) : (
                landings.map((landing) => (
                  <TableRow key={landing.id}>
                    <TableCell>
                      {new Date(landing.date).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>{landing.lotNumber}</TableCell>
                    <TableCell>{landing.supplier.name}</TableCell>
                    <TableCell>{landing.fishType}</TableCell>
                    <TableCell>{landing.weight.toFixed(1)}</TableCell>
                    <TableCell>{landing.grade || "-"}</TableCell>
                    <TableCell>{statusLabels[landing.status]}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
