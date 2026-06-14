"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const saleSchema = z.object({
  landingId: z.string().min(1, "水揚げを選択してください"),
  buyerId: z.string().min(1, "買受人を選択してください"),
  price: z.string().min(1, "価格を入力してください"),
})

type SaleFormData = z.infer<typeof saleSchema>

interface Landing {
  id: string
  lotNumber: string
  fishType: string
  weight: number
  grade: string | null
  supplier: {
    name: string
  }
}

interface Buyer {
  id: string
  name: string
  code: string
}

interface SaleFormProps {
  landings: Landing[]
  buyers: Buyer[]
  onSubmit: (data: SaleFormData) => Promise<void>
}

export function SaleForm({ landings, buyers, onSubmit }: SaleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
  })

  const landingId = watch("landingId")
  const buyerId = watch("buyerId")
  const selectedLanding = landings.find((l) => l.id === landingId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>販売情報入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="landingId">水揚げ選択 *</Label>
              <Select
                value={landingId}
                onValueChange={(value) => setValue("landingId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="未販売の水揚げを選択" />
                </SelectTrigger>
                <SelectContent>
                  {landings.map((landing) => (
                    <SelectItem key={landing.id} value={landing.id}>
                      {landing.lotNumber} - {landing.fishType} ({landing.weight}kg) - {landing.supplier.name}
                      {landing.grade && ` [${landing.grade}]`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.landingId && (
                <p className="text-sm text-red-600">{errors.landingId.message}</p>
              )}
            </div>

            {selectedLanding && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">選択中の水揚げ情報</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">ロット番号:</span>
                    <span className="ml-2 font-medium">{selectedLanding.lotNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">魚種:</span>
                    <span className="ml-2 font-medium">{selectedLanding.fishType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">重量:</span>
                    <span className="ml-2 font-medium">{selectedLanding.weight}kg</span>
                  </div>
                  <div>
                    <span className="text-gray-600">仕入先:</span>
                    <span className="ml-2 font-medium">{selectedLanding.supplier.name}</span>
                  </div>
                  {selectedLanding.grade && (
                    <div>
                      <span className="text-gray-600">等級:</span>
                      <span className="ml-2 font-medium">{selectedLanding.grade}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
              <Label htmlFor="price">販売価格 (円) *</Label>
              <Input
                id="price"
                type="number"
                step="1"
                placeholder="例: 50000"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "販売登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
