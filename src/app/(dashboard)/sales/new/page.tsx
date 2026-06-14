"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SaleForm } from "@/components/sale-form"

type Landing = {
  id: string
  lotNumber: string
  fishType: string
  weight: number
  grade: string | null
  supplier: {
    name: string
  }
}

type Buyer = {
  id: string
  name: string
  code: string
}

export default function NewSalePage() {
  const router = useRouter()
  const [landings, setLandings] = useState<Landing[]>([])
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/landings").then((res) => res.json()),
      fetch("/api/buyers").then((res) => res.json()),
    ])
      .then(([landingsData, buyersData]) => {
        // Filter only unsold landings
        const unsoldLandings = landingsData.filter(
          (landing: any) => landing.status === "LANDED"
        )
        setLandings(unsoldLandings)
        setBuyers(buyersData)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  async function createSale(data: any) {
    const response = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      router.push("/sales")
    }
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  if (landings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">販売新規登録</h1>
          <p className="mt-2 text-gray-600">新しい販売情報を登録します</p>
        </div>
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          販売可能な水揚げがありません。先に水揚げを登録してください。
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">販売新規登録</h1>
        <p className="mt-2 text-gray-600">新しい販売情報を登録します</p>
      </div>

      <SaleForm landings={landings} buyers={buyers} onSubmit={createSale} />
    </div>
  )
}
