"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Home, Fish, DollarSign, FileText, Users, Truck, Menu, X } from "lucide-react"

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
  const [isOpen, setIsOpen] = useState(false)

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
          "group flex items-center px-3 py-3 text-sm font-medium rounded-md",
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

  const navContent = (
    <>
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white">漁市場デジタル台帳</h1>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map(renderNavItem)}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            マスタ管理
          </p>
          <div className="space-y-1">
            {masterNavigation.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-900 text-white shadow-lg"
        aria-label="メニューを開く"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full w-64 flex-col bg-gray-900">
        {navContent}
      </div>
    </>
  )
}
