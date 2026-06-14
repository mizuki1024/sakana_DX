"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

const invoiceFormSchema = z.object({
  buyerId: z.string().min(1, "買受人を選択してください"),
  month: z.string().min(1, "対象月を選択してください"),
})

type InvoiceFormData = z.infer<typeof invoiceFormSchema>

interface Buyer {
  id: string
  name: string
  code: string
}

interface PreviewSale {
  id: string
  price: number
  saleDate: string
  landing: {
    lotNumber: string
    fishType: string
    weight: number
    supplier: {
      name: string
    }
  }
}

interface Preview {
  sales: PreviewSale[]
  totalAmount: number
  count: number
}

interface InvoiceFormProps {
  buyers: Buyer[]
  onSubmit: (data: InvoiceFormData) => Promise<void>
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price)
}

export function InvoiceForm({ buyers, onSubmit }: InvoiceFormProps) {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
  })

  const buyerId = watch("buyerId")
  const month = watch("month")

  // Get current month as default
  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    const fetchPreview = async () => {
      if (!buyerId || !month) {
        setPreview(null)
        return
      }

      setPreviewLoading(true)
      setPreviewError(null)

      try {
        const res = await fetch(`/api/invoices/preview?buyerId=${buyerId}&month=${month}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "プレビューの取得に失敗しました")
        }
        const data = await res.json()
        setPreview(data)
      } catch (err) {
        setPreviewError(err instanceof Error ? err.message : "エラーが発生しました")
        setPreview(null)
      } finally {
        setPreviewLoading(false)
      }
    }

    fetchPreview()
  }, [buyerId, month])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>請求書作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerId">買受人 *</Label>
                <Select
                  value={buyerId}
                  onValueChange={(value) => setValue("buyerId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="買受人を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.name} ({buyer.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.buyerId && (
                  <p className="text-sm text-red-600">{errors.buyerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">対象月 *</Label>
                <Input
                  id="month"
                  type="month"
                  defaultValue={currentMonth}
                  onChange={(e) => setValue("month", e.target.value)}
                />
                {errors.month && (
                  <p className="text-sm text-red-600">{errors.month.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/invoices">
                <Button type="button" variant="outline">
                  キャンセル
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || !preview || preview.count === 0}
              >
                {isSubmitting ? "作成中..." : "請求書を作成"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            請求対象の売上
            {preview && preview.count > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({preview.count}件 / 合計 {formatPrice(preview.totalAmount)})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewLoading ? (
            <p className="text-center py-8 text-gray-500">読み込み中...</p>
          ) : previewError ? (
            <p className="text-center py-8 text-red-500">{previewError}</p>
          ) : !buyerId || !month ? (
            <p className="text-center py-8 text-gray-500">
              買受人と対象月を選択してください
            </p>
          ) : !preview || preview.count === 0 ? (
            <p className="text-center py-8 text-gray-500">
              この買受人の対象月に未請求の売上がありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>売上日</TableHead>
                  <TableHead>ロット番号</TableHead>
                  <TableHead>仕入先</TableHead>
                  <TableHead>魚種</TableHead>
                  <TableHead>重量 (kg)</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.saleDate).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>{sale.landing.lotNumber}</TableCell>
                    <TableCell>{sale.landing.supplier.name}</TableCell>
                    <TableCell>{sale.landing.fishType}</TableCell>
                    <TableCell>{sale.landing.weight.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(sale.price)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={5} className="text-right">
                    合計
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(preview.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
