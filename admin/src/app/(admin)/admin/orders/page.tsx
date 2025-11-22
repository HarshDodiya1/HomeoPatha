import { OrdersTable } from "@/components/admin/tables/orders-table"

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Product Orders</h1>
        <p className="text-muted-foreground">Manage all product orders and their status</p>
      </div>
      <OrdersTable />
    </div>
  )
}
