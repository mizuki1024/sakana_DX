"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResponsiveTable } from "@/components/responsive-table"
import { Eye } from "lucide-react"

interface Invoice {
  id: string
  month: string
  buyerName: string
  buyerCode: string
  salesCount: number
  totalAmount: string
  totalAmountRaw: number
  status: string
  statusLabel: string
  createdAt: string
  [key: string]: string | number
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
}

export function InvoicesTable({ data }: { data: Invoice[] }) {
  const router = useRouter()

  const columns = [
    { key: "month", label: "請求月" },
    {
      key: "buyer",
      label: "買受人",
      render: (invoice: Invoice) => (
        <span>
          {invoice.buyerName}
          <span className="ml-1 text-gray-500 text-sm">({invoice.buyerCode})</span>
        </span>
      ),
    },
    { key: "salesCount", label: "売上件数", render: (invoice: Invoice) => `${invoice.salesCount}件`, hideOnMobile: true },
    { key: "totalAmount", label: "合計金額", className: "text-right font-medium" },
    {
      key: "status",
      label: "ステータス",
      render: (invoice: Invoice) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}
        >
          {invoice.statusLabel}
        </span>
      ),
    },
    { key: "createdAt", label: "作成日", hideOnMobile: true },
    {
      key: "action",
      label: "操作",
      render: (invoice: Invoice) => (
        <Link href={`/invoices/${invoice.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <ResponsiveTable<Invoice>
      data={data}
      columns={columns}
      keyField="id"
      emptyMessage="請求書データがありません"
      onRowClick={(invoice: Invoice) => router.push(`/invoices/${invoice.id}`)}
      mobileCard={(invoice: Invoice) => (
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{invoice.buyerName}</p>
              <p className="text-sm text-gray-500">{invoice.month}</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}
            >
              {invoice.statusLabel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{invoice.salesCount}件の売上</span>
            <span className="text-lg font-bold text-blue-600">{invoice.totalAmount}</span>
          </div>
          <div className="text-sm text-gray-400">
            作成: {invoice.createdAt}
          </div>
        </div>
      )}
    />
  )
}
