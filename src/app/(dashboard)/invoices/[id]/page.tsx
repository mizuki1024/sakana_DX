import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PrintButton } from "./print-button"
import { StatusButtons } from "./status-buttons"

const statusLabels = {
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

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      buyer: true,
      sales: {
        include: {
          landing: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: {
          saleDate: "asc",
        },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">請求書詳細</h1>
            <p className="mt-1 text-gray-600">
              {formatMonth(invoice.month)} / {invoice.buyer.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusButtons invoiceId={invoice.id} currentStatus={invoice.status} />
          <PrintButton />
        </div>
      </div>

      {/* Print-optimized invoice content */}
      <div id="invoice-content" className="print:p-8">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">請求書</h2>
                <p className="text-gray-600">{formatMonth(invoice.month)}分</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  発行日: {new Date(invoice.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <p className="text-sm text-gray-500">
                  ステータス: {statusLabels[invoice.status]}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buyer Info */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">請求先</h3>
              <p className="text-xl">{invoice.buyer.name} 様</p>
              <p className="text-gray-600">コード: {invoice.buyer.code}</p>
              {invoice.buyer.email && (
                <p className="text-gray-600">{invoice.buyer.email}</p>
              )}
              {invoice.buyer.phone && (
                <p className="text-gray-600">{invoice.buyer.phone}</p>
              )}
            </div>

            {/* Sales Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">明細</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>売上日</TableHead>
                    <TableHead>ロット番号</TableHead>
                    <TableHead>仕入先</TableHead>
                    <TableHead>魚種</TableHead>
                    <TableHead>重量 (kg)</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {new Date(sale.saleDate).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>{sale.landing.lotNumber}</TableCell>
                      <TableCell>{sale.landing.supplier.name}</TableCell>
                      <TableCell>{sale.landing.fishType}</TableCell>
                      <TableCell>{sale.landing.weight.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(sale.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">小計</span>
                    <span>{formatPrice(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-gray-900 font-bold text-xl">
                    <span>合計</span>
                    <span>{formatPrice(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - hidden in print */}
            <div className="text-center text-sm text-gray-500 pt-8 print:hidden">
              <p>漁市場デジタル台帳</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
