"use client"

import { useRouter } from "next/navigation"
import { SupplierForm } from "@/components/supplier-form"

export default function NewSupplierPage() {
  const router = useRouter()

  const handleSubmit = async (data: { code: string; name: string; contact?: string }) => {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "登録に失敗しました")
    }

    router.push("/suppliers")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仕入先登録</h1>
        <p className="mt-2 text-gray-600">新しい仕入先を登録します</p>
      </div>

      <SupplierForm onSubmit={handleSubmit} />
    </div>
  )
}
