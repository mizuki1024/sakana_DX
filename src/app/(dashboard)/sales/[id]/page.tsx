"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SettlementData = {
  saleId: string
  saleDate: string
  lotNumber: string
  fishType: string
  weight: number
  grade: string | null
  supplier: {
    name: string
    code: string
  }
  buyer: {
    name: string
    code: string
  }
  price: number
  commission: number
  netAmount: number
}

export default function SaleDetailPage() {
  const params = useParams()
  const [settlement, setSettlement] = useState<SettlementData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/sales/${params.id}/settlement`)
        .then((res) => res.json())
        .then((data) => {
          setSettlement(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  if (!settlement) {
    return <div className="p-8">販売情報が見つかりません</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">販売詳細・仕切書</h1>
          <p className="mt-2 text-gray-600">販売情報の詳細と仕切書</p>
        </div>
        <Button onClick={handlePrint}>印刷</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">仕切書</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-right text-sm text-gray-600">
            発行日: {formatDate(settlement.saleDate)}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-2">仕入先情報</h3>
              <div className="space-y-1">
                <div>
                  <span className="text-gray-600">仕入先名:</span>
                  <span className="ml-2 font-medium">{settlement.supplier.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">仕入先コード:</span>
                  <span className="ml-2 font-medium">{settlement.supplier.code}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg border-b pb-2">買受人情報</h3>
              <div className="space-y-1">
                <div>
                  <span className="text-gray-600">買受人名:</span>
                  <span className="ml-2 font-medium">{settlement.buyer.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">買受人コード:</span>
                  <span className="ml-2 font-medium">{settlement.buyer.code}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">商品情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">ロット番号:</span>
                <span className="ml-2 font-medium font-mono">{settlement.lotNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">魚種:</span>
                <span className="ml-2 font-medium">{settlement.fishType}</span>
              </div>
              <div>
                <span className="text-gray-600">重量:</span>
                <span className="ml-2 font-medium">{settlement.weight}kg</span>
              </div>
              {settlement.grade && (
                <div>
                  <span className="text-gray-600">等級:</span>
                  <span className="ml-2 font-medium">{settlement.grade}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg border-b pb-2">販売金額</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">販売価格:</span>
                <span className="font-semibold">{formatPrice(settlement.price)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>手数料 (5%):</span>
                <span>-{formatPrice(settlement.commission)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>仕切金額:</span>
                <span className="text-blue-600">{formatPrice(settlement.netAmount)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            販売ID: {settlement.saleId}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
