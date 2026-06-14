import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Fish, Package } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch today's landings
  const todayLandings = await prisma.landing.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  // Calculate today's total weight
  const todayTotalWeight = todayLandings.reduce(
    (sum, landing) => sum + landing.weight,
    0
  )

  // Count unsold landings
  const unsoldCount = await prisma.landing.count({
    where: {
      status: "LANDED",
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">システムの概要を確認できます</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本日の水揚げ
            </CardTitle>
            <Fish className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLandings.length} 件</div>
            <p className="text-xs text-gray-600 mt-1">
              {new Date().toLocaleDateString("ja-JP")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              本日の総重量
            </CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayTotalWeight.toFixed(1)} kg
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {new Date().toLocaleDateString("ja-JP")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              未販売件数
            </CardTitle>
            <Fish className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unsoldCount} 件</div>
            <p className="text-xs text-gray-600 mt-1">販売待ち</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近の水揚げ</CardTitle>
        </CardHeader>
        <CardContent>
          {todayLandings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              本日の水揚げデータがありません
            </p>
          ) : (
            <div className="space-y-4">
              {todayLandings.slice(0, 5).map((landing) => (
                <div
                  key={landing.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{landing.fishType}</p>
                    <p className="text-sm text-gray-600">
                      {landing.lotNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{landing.weight.toFixed(1)} kg</p>
                    <p className="text-sm text-gray-600">
                      {landing.grade || "等級なし"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
