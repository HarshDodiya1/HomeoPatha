"use client"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts"

const apptData = [
  { month: "Jan", appointments: 120 },
  { month: "Feb", appointments: 160 },
  { month: "Mar", appointments: 140 },
  { month: "Apr", appointments: 200 },
  { month: "May", appointments: 210 },
  { month: "Jun", appointments: 190 },
]

const salesData = [
  { month: "Jan", sales: 3200 },
  { month: "Feb", sales: 2800 },
  { month: "Mar", sales: 3600 },
  { month: "Apr", sales: 4100 },
  { month: "May", sales: 3900 },
  { month: "Jun", sales: 4500 },
]

const chartConfig = {
  appointments: { label: "Appointments", color: "oklch(0.62 0.08 230)" },
  sales: { label: "Sales", color: "oklch(0.68 0.07 200)" },
}

export function AppointmentsOverview() {
  return (
    <ChartContainer config={chartConfig} className="w-full">
      <LineChart data={apptData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Line type="monotone" dataKey="appointments" stroke="var(--color-appointments)" strokeWidth={2} dot={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  )
}

export function ProductSalesTrends() {
  return (
    <ChartContainer config={chartConfig} className="w-full">
      <BarChart data={salesData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Bar dataKey="sales" fill="var(--color-sales)" radius={[6, 6, 0, 0]} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  )
}
