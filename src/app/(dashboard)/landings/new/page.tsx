"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LandingForm } from "@/components/landing-form"

type Supplier = {
  id: string
  name: string
  code: string
}

export default function NewLandingPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((data) => {
        setSuppliers(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  async function createLanding(data: any) {
    const response = await fetch("/api/landings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      router.push("/landings")
    }
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">水揚げ新規登録</h1>
        <p className="mt-2 text-gray-600">新しい水揚げ情報を登録します</p>
      </div>

      <LandingForm suppliers={suppliers} onSubmit={createLanding} />
    </div>
  )
}
