import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const statusLabels: Record<string, string> = {
  LANDED: "水揚げ済み",
  SOLD: "販売済み",
  INVOICED: "請求済み",
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const landings = await prisma.landing.findMany({
      include: {
        supplier: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    // CSV header
    const headers = [
      "日付",
      "ロット番号",
      "仕入先コード",
      "仕入先名",
      "魚種",
      "重量(kg)",
      "等級",
      "保管場所",
      "ステータス",
      "登録日時",
    ]

    // CSV rows
    const rows = landings.map((landing) => [
      new Date(landing.date).toLocaleDateString("ja-JP"),
      landing.lotNumber,
      landing.supplier.code,
      landing.supplier.name,
      landing.fishType,
      landing.weight.toFixed(1),
      landing.grade || "",
      landing.storageLocation || "",
      statusLabels[landing.status] || landing.status,
      new Date(landing.createdAt).toLocaleString("ja-JP"),
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

    const filename = `水揚げ一覧_${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export landings" },
      { status: 500 }
    )
  }
}
