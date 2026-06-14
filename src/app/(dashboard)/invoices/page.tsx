import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExportButton } from "@/components/export-button"
import { InvoicesTable } from "./invoices-table"

const statusLabels: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送付済み",
  PAID: "入金済み",
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price)
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  return `${year}年${parseInt(m)}月`
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      buyer: true,
      _count: {
        select: { sales: true },
      },
    },
    orderBy: [
      { month: "desc" },
      { createdAt: "desc" },
    ],
  })

  const formattedInvoices = invoices.map((invoice) => ({
    id: invoice.id,
    month: formatMonth(invoice.month),
    buyerName: invoice.buyer.name,
    buyerCode: invoice.buyer.code,
    salesCount: invoice._count.sales,
    totalAmount: formatPrice(invoice.totalAmount),
    totalAmountRaw: invoice.totalAmount,
    status: invoice.status,
    statusLabel: statusLabels[invoice.status] || invoice.status,
    createdAt: new Date(invoice.createdAt).toLocaleDateString("ja-JP"),
  }))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">請求管理</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">請求書の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          <ExportButton endpoint="/api/invoices/export" />
          <Link href="/invoices/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">請求書一覧</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <InvoicesTable data={formattedInvoices} />
        </CardContent>
      </Card>
    </div>
  )
}
