"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExportButton } from "@/components/export-button"

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
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">売上管理</h1>
          <p className="mt-2 text-gray-600">売上情報の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          <ExportButton endpoint="/api/sales/export" />
          <Link href="/sales/new">
            <Button>新規販売登録</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>売上一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>売上日</TableHead>
                <TableHead>ロット番号</TableHead>
                <TableHead>魚種</TableHead>
                <TableHead>重量</TableHead>
                <TableHead>仕入先</TableHead>
                <TableHead>買受人</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    売上データがありません
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.saleDate)}</TableCell>
                    <TableCell className="font-mono">{sale.landing.lotNumber}</TableCell>
                    <TableCell>{sale.landing.fishType}</TableCell>
                    <TableCell>{sale.landing.weight}kg</TableCell>
                    <TableCell>{sale.landing.supplier.name}</TableCell>
                    <TableCell>{sale.buyer.name}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(sale.price)}</TableCell>
                    <TableCell>
                      <Link href={`/sales/${sale.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                    </TableCell>
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
