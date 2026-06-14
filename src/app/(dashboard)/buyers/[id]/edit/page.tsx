"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BuyerForm } from "@/components/buyer-form"
import { use } from "react"

interface Buyer {
  id: string
  code: string
  name: string
  email: string | null
  phone: string | null
}

export default function EditBuyerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const res = await fetch(`/api/buyers/${id}`)
        if (!res.ok) {
          throw new Error("買受人が見つかりません")
        }
        const data = await res.json()
        setBuyer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchBuyer()
  }, [id])

  const handleSubmit = async (data: { code: string; name: string; email?: string; phone?: string }) => {
    const res = await fetch(`/api/buyers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "更新に失敗しました")
    }

    router.push("/buyers")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (error || !buyer) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error || "データが見つかりません"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">買受人編集</h1>
        <p className="mt-2 text-gray-600">買受人情報を編集します</p>
      </div>

      <BuyerForm
        defaultValues={{
          code: buyer.code,
          name: buyer.name,
          email: buyer.email || "",
          phone: buyer.phone || "",
        }}
        onSubmit={handleSubmit}
        isEdit
      />
    </div>
  )
}
