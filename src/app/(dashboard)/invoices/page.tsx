import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExportButton } from "@/components/export-button"

const statusLabels = {
  DRAFT: "下書き",
  SENT: "送付済み",
  PAID: "入金済み",
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">請求管理</h1>
          <p className="mt-2 text-gray-600">請求書の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          <ExportButton endpoint="/api/invoices/export" />
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>請求書一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>請求月</TableHead>
                <TableHead>買受人</TableHead>
                <TableHead>売上件数</TableHead>
                <TableHead className="text-right">合計金額</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    請求書データがありません
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {formatMonth(invoice.month)}
                    </TableCell>
                    <TableCell>
                      {invoice.buyer.name}
                      <span className="ml-1 text-gray-500 text-sm">
                        ({invoice.buyer.code})
                      </span>
                    </TableCell>
                    <TableCell>{invoice._count.sales}件</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[invoice.status]
                        }`}
                      >
                        {statusLabels[invoice.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
