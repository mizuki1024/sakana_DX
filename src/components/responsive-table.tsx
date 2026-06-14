"use client"

import { cn } from "@/lib/utils"

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  emptyMessage?: string
  onRowClick?: (item: T) => void
  mobileCard?: (item: T) => React.ReactNode
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  emptyMessage = "データがありません",
  onRowClick,
  mobileCard,
}: ResponsiveTableProps<T>) {
  const getValue = (item: T, key: string) => {
    const keys = key.split(".")
    let value: unknown = item
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return value
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "bg-white border rounded-lg p-4 shadow-sm",
              onRowClick && "cursor-pointer active:bg-gray-50"
            )}
          >
            {mobileCard ? (
              mobileCard(item)
            ) : (
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={String(col.key)} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{col.label}</span>
                    <span className="text-sm font-medium">
                      {col.render
                        ? col.render(item)
                        : String(getValue(item, String(col.key)) ?? "-")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-gray-500",
                    col.className,
                    col.hideOnMobile && "hidden lg:table-cell"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={String(item[keyField])}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b transition-colors hover:bg-gray-50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "p-4 align-middle",
                      col.className,
                      col.hideOnMobile && "hidden lg:table-cell"
                    )}
                  >
                    {col.render
                      ? col.render(item)
                      : String(getValue(item, String(col.key)) ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
