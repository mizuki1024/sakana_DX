"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const supplierFormSchema = z.object({
  code: z.string().min(1, "コードを入力してください"),
  name: z.string().min(1, "名称を入力してください"),
  contact: z.string().optional(),
})

type SupplierFormData = z.infer<typeof supplierFormSchema>

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormData>
  onSubmit: (data: SupplierFormData) => Promise<void>
  isEdit?: boolean
}

export function SupplierForm({ defaultValues, onSubmit, isEdit = false }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "仕入先編集" : "仕入先登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">コード *</Label>
              <Input
                id="code"
                placeholder="例: S001"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                placeholder="例: 山田漁業"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="contact">連絡先</Label>
              <Input
                id="contact"
                placeholder="例: 090-1234-5678 / yamada@example.com"
                {...register("contact")}
              />
              {errors.contact && (
                <p className="text-sm text-red-600">{errors.contact.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/suppliers">
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : isEdit ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
