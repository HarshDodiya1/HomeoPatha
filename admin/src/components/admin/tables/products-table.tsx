"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

const rows = [
  { id: "pr1", image: "/diverse-products-still-life.png", name: "Vitamin D", price: "$12.00", stock: 22 },
  { id: "pr2", image: "/diverse-products-still-life.png", name: "Skin Cream", price: "$18.00", stock: 8 },
  { id: "pr3", image: "/diverse-products-still-life.png", name: "Pain Reliever", price: "$9.00", stock: 50 },
]

export function ProductsTable() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>All Products</CardTitle>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <img src={r.image || "/placeholder.svg"} alt="product" className="size-10 rounded-md" />
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.price}</TableCell>
                  <TableCell>{r.stock}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/products/${r.id}/edit`}>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
