"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExportButton } from "@/components/export-button"
import { ResponsiveTable } from "@/components/responsive-table"
import { Plus } from "lucide-react"

type Sale = {
  id: string
  saleDate: string
  price: number
  landing: {
    lotNumber: string
    fishType: string
    weight: number
    supplier: {
      name: string
    }
  }
  buyer: {
    name: string
  }
}

export default function SalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => {
        setSales(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price)
  }

  if (loading) {
    return <div className="p-4 md:p-8">読み込み中...</div>
  }

  const columns = [
    { key: "saleDate", label: "売上日", render: (sale: Sale) => formatDate(sale.saleDate) },
    { key: "lotNumber", label: "ロット番号", render: (sale: Sale) => sale.landing.lotNumber },
    { key: "fishType", label: "魚種", render: (sale: Sale) => sale.landing.fishType },
    { key: "weight", label: "重量", render: (sale: Sale) => `${sale.landing.weight}kg`, hideOnMobile: true },
    { key: "supplier", label: "仕入先", render: (sale: Sale) => sale.landing.supplier.name, hideOnMobile: true },
    { key: "buyer", label: "買受人", render: (sale: Sale) => sale.buyer.name },
    { key: "price", label: "金額", render: (sale: Sale) => formatPrice(sale.price) },
    {
      key: "action",
      label: "操作",
      render: (sale: Sale) => (
        <Link href={`/sales/${sale.id}`}>
          <Button variant="outline" size="sm">詳細</Button>
        </Link>
      )
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">売上管理</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">売上情報の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          <ExportButton endpoint="/api/sales/export" />
          <Link href="/sales/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              新規登録
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">売上一覧</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <ResponsiveTable
            data={sales}
            columns={columns}
            keyField="id"
            emptyMessage="売上データがありません"
            onRowClick={(sale) => router.push(`/sales/${sale.id}`)}
            mobileCard={(sale) => (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{sale.landing.fishType}</p>
                    <p className="text-sm text-gray-500">{sale.landing.lotNumber}</p>
                  </div>
                  <span className="font-bold text-blue-600">{formatPrice(sale.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{sale.landing.supplier.name}</span>
                  <span>{sale.landing.weight}kg</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatDate(sale.saleDate)}</span>
                  <span>→ {sale.buyer.name}</span>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
