"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { InvoiceForm } from "@/components/invoice-form"

interface Buyer {
  id: string
  name: string
  code: string
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const res = await fetch("/api/buyers")
        if (!res.ok) {
          throw new Error("買受人データの取得に失敗しました")
        }
        const data = await res.json()
        setBuyers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました")
      } finally {
        setLoading(false)
      }
    }

    fetchBuyers()
  }, [])

  const handleSubmit = async (data: { buyerId: string; month: string }) => {
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || "請求書の作成に失敗しました")
      return
    }

    router.push("/invoices")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">請求書作成</h1>
        <p className="mt-2 text-gray-600">
          買受人と対象月を選択して請求書を作成します
        </p>
      </div>

      <InvoiceForm buyers={buyers} onSubmit={handleSubmit} />
    </div>
  )
}
