import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const statusLabels: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送付済み",
  PAID: "入金済み",
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // CSV header
    const headers = [
      "請求月",
      "買受人コード",
      "買受人名",
      "売上件数",
      "合計金額",
      "ステータス",
      "作成日時",
    ]

    // CSV rows
    const rows = invoices.map((invoice) => [
      invoice.month,
      invoice.buyer.code,
      invoice.buyer.name,
      invoice._count.sales.toString(),
      invoice.totalAmount.toFixed(0),
      statusLabels[invoice.status] || invoice.status,
      new Date(invoice.createdAt).toLocaleString("ja-JP"),
    ])

    // Build CSV content with BOM for Excel compatibility
    const BOM = "\uFEFF"
    const csvContent =
      BOM +
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              const str = String(cell)
              if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`
              }
              return str
            })
            .join(",")
        )
        .join("\n")

    const filename = `請求一覧_${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export invoices" },
      { status: 500 }
    )
  }
}
