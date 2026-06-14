"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SupplierForm } from "@/components/supplier-form"
import { use } from "react"

interface Supplier {
  id: string
  code: string
  name: string
  contact: string | null
}

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await fetch(`/api/suppliers/${id}`)
        if (!res.ok) {
          throw new Error("仕入先が見つかりません")
        }
        const data = await res.json()
        setSupplier(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchSupplier()
  }, [id])

  const handleSubmit = async (data: { code: string; name: string; contact?: string }) => {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "更新に失敗しました")
    }

    router.push("/suppliers")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error || "データが見つかりません"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仕入先編集</h1>
        <p className="mt-2 text-gray-600">仕入先情報を編集します</p>
      </div>

      <SupplierForm
        defaultValues={{
          code: supplier.code,
          name: supplier.name,
          contact: supplier.contact || "",
        }}
        onSubmit={handleSubmit}
        isEdit
      />
    </div>
  )
}
