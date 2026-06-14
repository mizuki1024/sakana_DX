import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DeleteSupplierButton } from "./delete-button"

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      code: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仕入先管理</h1>
          <p className="mt-2 text-gray-600">仕入先マスタの一覧と管理</p>
        </div>
        <Link href="/suppliers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>仕入先一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コード</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>連絡先</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    仕入先データがありません
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.code}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/suppliers/${supplier.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteSupplierButton id={supplier.id} name={supplier.name} />
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
