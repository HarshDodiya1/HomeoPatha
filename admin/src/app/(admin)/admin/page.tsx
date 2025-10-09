import { StatCard } from "@/components/admin/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentsOverview, ProductSalesTrends } from "@/components/admin/charts"

export default function AdminDashboardPage() {
  return (
    <main className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Appointments" value="1,220" hint="+8% this month" />
        <StatCard title="Total Patients" value="4,532" hint="+2% new" />
        <StatCard title="Products Sold" value="2,148" hint="+4% this month" />
        <StatCard title="Revenue" value="$42,380" hint="+6% this month" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointments Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <AppointmentsOverview />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Sales Trends</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ProductSalesTrends />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
