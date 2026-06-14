"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const landingSchema = z.object({
  date: z.string().min(1, "日付を入力してください"),
  supplierId: z.string().min(1, "仕入先を選択してください"),
  fishType: z.string().min(1, "魚種を入力してください"),
  lotNumber: z.string().optional(),
  weight: z.string().min(1, "重量を入力してください"),
  grade: z.string().optional(),
  storageLocation: z.string().optional(),
})

type LandingFormData = z.infer<typeof landingSchema>

interface LandingFormProps {
  suppliers: Array<{ id: string; name: string; code: string }>
  onSubmit: (data: LandingFormData) => Promise<void>
}

export function LandingForm({ suppliers, onSubmit }: LandingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LandingFormData>({
    resolver: zodResolver(landingSchema),
  })

  const supplierId = watch("supplierId")

  return (
    <Card>
      <CardHeader>
        <CardTitle>水揚げ情報入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">水揚げ日 *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">仕入先 *</Label>
              <Select
                value={supplierId}
                onValueChange={(value) => setValue("supplierId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="仕入先を選択" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && (
                <p className="text-sm text-red-600">{errors.supplierId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fishType">魚種 *</Label>
              <Input
                id="fishType"
                placeholder="例: マグロ"
                {...register("fishType")}
              />
              {errors.fishType && (
                <p className="text-sm text-red-600">{errors.fishType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotNumber">ロット番号 (未入力時は自動生成)</Label>
              <Input
                id="lotNumber"
                placeholder="例: LOT-20260613-001"
                {...register("lotNumber")}
              />
              {errors.lotNumber && (
                <p className="text-sm text-red-600">{errors.lotNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">重量 (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="例: 150.5"
                {...register("weight")}
              />
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">等級</Label>
              <Input
                id="grade"
                placeholder="例: A"
                {...register("grade")}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="storageLocation">保管場所</Label>
              <Input
                id="storageLocation"
                placeholder="例: 冷蔵庫A-01"
                {...register("storageLocation")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
