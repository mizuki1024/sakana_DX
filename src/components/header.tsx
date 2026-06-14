"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b bg-white px-8 flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {/* ページタイトルはここに表示 */}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p className="font-medium text-gray-900">{session?.user?.name}</p>
          <p className="text-gray-500">{session?.user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </header>
  )
}
