import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DeleteBuyerButton } from "./delete-button"

export default async function BuyersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const buyers = await prisma.buyer.findMany({
    orderBy: {
      code: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">買受人管理</h1>
          <p className="mt-2 text-gray-600">買受人マスタの一覧と管理</p>
        </div>
        <Link href="/buyers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>買受人一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コード</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    買受人データがありません
                  </TableCell>
                </TableRow>
              ) : (
                buyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-medium">{buyer.code}</TableCell>
                    <TableCell>{buyer.name}</TableCell>
                    <TableCell>{buyer.email || "-"}</TableCell>
                    <TableCell>{buyer.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/buyers/${buyer.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteBuyerButton id={buyer.id} name={buyer.name} />
                      </div>
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
