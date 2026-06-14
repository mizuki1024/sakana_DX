"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Send, CheckCircle, RotateCcw } from "lucide-react"

interface StatusButtonsProps {
  invoiceId: string
  currentStatus: "DRAFT" | "SENT" | "PAID"
}

export function StatusButtons({ invoiceId, currentStatus }: StatusButtonsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`ステータスを変更してもよろしいですか？`)) {
      return
    }

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "ステータスの更新に失敗しました")
        return
      }

      router.refresh()
    } catch (error) {
      alert("ステータスの更新に失敗しました")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex gap-2 print:hidden">
      {currentStatus === "DRAFT" && (
        <Button
          onClick={() => updateStatus("SENT")}
          disabled={isUpdating}
          variant="default"
        >
          <Send className="mr-2 h-4 w-4" />
          送付済みにする
        </Button>
      )}
      {currentStatus === "SENT" && (
        <>
          <Button
            onClick={() => updateStatus("PAID")}
            disabled={isUpdating}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            入金済みにする
          </Button>
          <Button
            onClick={() => updateStatus("DRAFT")}
            disabled={isUpdating}
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            下書きに戻す
          </Button>
        </>
      )}
      {currentStatus === "PAID" && (
        <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
          <CheckCircle className="mr-2 h-4 w-4" />
          入金済み（確定）
        </span>
      )}
    </div>
  )
}
