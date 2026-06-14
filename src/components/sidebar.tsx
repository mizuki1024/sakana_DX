"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Fish, DollarSign, FileText, Users, Truck } from "lucide-react"

const navigation = [
  { name: "ダッシュボード", href: "/", icon: Home },
  { name: "水揚げ管理", href: "/landings", icon: Fish },
  { name: "売上管理", href: "/sales", icon: DollarSign },
  { name: "請求管理", href: "/invoices", icon: FileText },
]

const masterNavigation = [
  { name: "買受人管理", href: "/buyers", icon: Users },
  { name: "仕入先管理", href: "/suppliers", icon: Truck },
]

export function Sidebar() {
  const pathname = usePathname()

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        )}
      >
        <item.icon
          className={cn(
            "mr-3 h-6 w-6 flex-shrink-0",
            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
          )}
        />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">漁市場デジタル台帳</h1>
      </div>
      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {navigation.map(renderNavItem)}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            マスタ管理
          </p>
          <div className="space-y-1">
            {masterNavigation.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </div>
  )
}
