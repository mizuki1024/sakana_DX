"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const buyerFormSchema = z.object({
  code: z.string().min(1, "コードを入力してください"),
  name: z.string().min(1, "名称を入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().optional(),
})

type BuyerFormData = z.infer<typeof buyerFormSchema>

interface BuyerFormProps {
  defaultValues?: Partial<BuyerFormData>
  onSubmit: (data: BuyerFormData) => Promise<void>
  isEdit?: boolean
}

export function BuyerForm({ defaultValues, onSubmit, isEdit = false }: BuyerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerFormSchema),
    defaultValues,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "買受人編集" : "買受人登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">コード *</Label>
              <Input
                id="code"
                placeholder="例: B001"
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
                placeholder="例: 株式会社マルイチ"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="例: contact@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                placeholder="例: 03-1234-5678"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/buyers">
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
