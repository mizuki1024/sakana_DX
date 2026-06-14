"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DeleteSupplierButtonProps {
  id: string
  name: string
}

export function DeleteSupplierButton({ id, name }: DeleteSupplierButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`「${name}」を削除してもよろしいですか？`)) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "削除に失敗しました")
        return
      }

      router.refresh()
    } catch (error) {
      alert("削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
