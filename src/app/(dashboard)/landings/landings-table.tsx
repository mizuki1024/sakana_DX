"use client"

import { ResponsiveTable } from "@/components/responsive-table"

interface Landing {
  id: string
  date: string
  lotNumber: string
  supplierName: string
  fishType: string
  weight: string
  grade: string
  status: string
  [key: string]: string
}

const columns = [
  { key: "date", label: "日付" },
  { key: "lotNumber", label: "ロット番号" },
  { key: "supplierName", label: "仕入先" },
  { key: "fishType", label: "魚種" },
  { key: "weight", label: "重量 (kg)" },
  { key: "grade", label: "等級", hideOnMobile: true },
  { key: "status", label: "ステータス" },
]

export function LandingsTable({ data }: { data: Landing[] }) {
  return (
    <ResponsiveTable<Landing>
      data={data}
      columns={columns}
      keyField="id"
      emptyMessage="水揚げデータがありません"
      mobileCard={(item: Landing) => (
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{item.fishType}</p>
              <p className="text-sm text-gray-500">{item.lotNumber}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {item.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{item.supplierName}</span>
            <span className="font-medium">{item.weight} kg</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{item.date}</span>
            <span>等級: {item.grade}</span>
          </div>
        </div>
      )}
    />
  )
}
