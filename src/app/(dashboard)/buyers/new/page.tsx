"use client"

import { useRouter } from "next/navigation"
import { BuyerForm } from "@/components/buyer-form"

export default function NewBuyerPage() {
  const router = useRouter()

  const handleSubmit = async (data: { code: string; name: string; email?: string; phone?: string }) => {
    const res = await fetch("/api/buyers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "登録に失敗しました")
    }

    router.push("/buyers")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">買受人登録</h1>
        <p className="mt-2 text-gray-600">新しい買受人を登録します</p>
      </div>

      <BuyerForm onSubmit={handleSubmit} />
    </div>
  )
}
