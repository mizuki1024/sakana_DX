import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sales = await prisma.sale.findMany({
      include: {
        landing: {
          include: {
            supplier: true,
          },
        },
        buyer: true,
        invoice: true,
      },
      orderBy: {
        saleDate: "desc",
      },
    })

    // CSV header
    const headers = [
      "売上日",
      "ロット番号",
      "仕入先コード",
      "仕入先名",
      "魚種",
      "重量(kg)",
      "買受人コード",
      "買受人名",
      "販売金額",
      "請求書番号",
      "登録日時",
    ]

    // CSV rows
    const rows = sales.map((sale) => [
      new Date(sale.saleDate).toLocaleDateString("ja-JP"),
      sale.landing.lotNumber,
      sale.landing.supplier.code,
      sale.landing.supplier.name,
      sale.landing.fishType,
      sale.landing.weight.toFixed(1),
      sale.buyer.code,
      sale.buyer.name,
      sale.price.toFixed(0),
      sale.invoice ? sale.invoice.month : "",
      new Date(sale.createdAt).toLocaleString("ja-JP"),
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

    const filename = `売上一覧_${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export sales" },
      { status: 500 }
    )
  }
}
