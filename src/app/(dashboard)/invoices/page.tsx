import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">請求管理</h1>
        <p className="mt-2 text-gray-600">請求書の一覧と管理</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>請求書一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>請求月</TableHead>
                <TableHead>買受人</TableHead>
                <TableHead>合計金額</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>作成日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  請求書データがありません
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
