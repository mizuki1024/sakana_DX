"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface ExportButtonProps {
  endpoint: string
  label?: string
}

export function ExportButton({ endpoint, label = "CSV出力" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(endpoint)
      if (!res.ok) {
        throw new Error("エクスポートに失敗しました")
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get("Content-Disposition")
      let filename = "export.csv"

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)/)
        if (match) {
          filename = decodeURIComponent(match[1])
        }
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert("CSVエクスポートに失敗しました")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "出力中..." : label}
    </Button>
  )
}
