"use client"

import { useEffect, useState } from "react"
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Bar, 
  BarChart, 
  Cell, 
  Line,
  ComposedChart,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"
import { analyticsService } from "@/lib/services/analytics.service"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// Cohesive color palette matching website theme - soft blues and teals
const CHART_COLORS = {
  primary: '#5B8DEF',      // Soft blue (primary)
  secondary: '#7BA3F0',    // Light blue
  accent: '#4A7AD6',       // Deep blue
  success: '#6BB6B0',      // Teal
  warning: '#E8A87C',      // Soft orange
  muted: '#D4DCE8',        // Light gray-blue
}

export function OrdersAppointmentsComparison() {
  const [combinedData, setCombinedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComparisonData()
  }, [])

  const fetchComparisonData = async () => {
    try {
      setIsLoading(true)
      const [ordersResponse, appointmentsResponse] = await Promise.all([
        analyticsService.getOrdersAnalytics(),
        analyticsService.getAppointmentsAnalytics()
      ])

      const orders = ordersResponse.data.data.ordersByStatus
      const appointments = appointmentsResponse.data.data.appointmentsOverTime

      // Combine data for comparison
      const combined = appointments.map((appt: any) => {
        const matchingOrder = orders.find((o: any) => o._id === appt._id)
        return {
          date: appt._id,
          appointments: appt.count,
          orders: matchingOrder?.count || 0
        }
      })

      setCombinedData(combined)
    } catch (error) {
      console.error('Failed to fetch comparison data:', error)
      toast.error('Failed to load comparison data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: CHART_COLORS.primary }} />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.muted} opacity={0.5} />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.date}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-6">
                      <span className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                        Appointments
                      </span>
                      <span className="font-semibold text-sm">{payload[0].value}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.success }} />
                        Orders
                      </span>
                      <span className="font-semibold text-sm">{payload[1]?.value || 0}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={40}
          iconType="circle"
          wrapperStyle={{ paddingBottom: '10px' }}
        />
        <Area 
          type="monotone" 
          dataKey="appointments" 
          stroke={CHART_COLORS.primary}
          fillOpacity={1} 
          fill="url(#appointmentsGradient)"
          strokeWidth={2.5}
          name="Appointments"
        />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke={CHART_COLORS.success}
          strokeWidth={2.5}
          dot={{ fill: CHART_COLORS.success, r: 4 }}
          name="Orders"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function TopProductsChart() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      setIsLoading(true)
      const response = await analyticsService.getOrdersAnalytics()
      setData(response.data.data.topProducts.slice(0, 8))
    } catch (error) {
      console.error('Failed to fetch top products:', error)
      toast.error('Failed to load top products')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: CHART_COLORS.primary }} />
      </div>
    )
  }

  // Generate harmonious colors from the palette
  const generateColor = (index: number) => {
    const colors = [
      CHART_COLORS.primary,
      CHART_COLORS.secondary, 
      CHART_COLORS.success,
      CHART_COLORS.accent,
      '#93C5FD', // lighter blue
      '#5EEAD4', // lighter teal
      '#A5B4FC', // lavender
      '#BFDBFE', // sky blue
    ]
    return colors[index % colors.length]
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.muted} opacity={0.5} />
        <XAxis 
          dataKey="title" 
          angle={-45} 
          textAnchor="end" 
          height={80}
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <p className="font-semibold text-gray-800 text-sm mb-2">{payload[0].payload.title}</p>
                  <p className="text-sm text-gray-600 mb-1">Units Sold: <span className="font-semibold">{payload[0].value}</span></p>
                  <p className="text-sm font-semibold" style={{ color: CHART_COLORS.success }}>
                    Revenue: ₹{payload[0].payload.totalRevenue.toLocaleString()}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="totalQuantity" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={generateColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopDoctorsChart() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopDoctors()
  }, [])

  const fetchTopDoctors = async () => {
    try {
      setIsLoading(true)
      const response = await analyticsService.getAppointmentsAnalytics()
      setData(response.data.data.topDoctors.slice(0, 8))
    } catch (error) {
      console.error('Failed to fetch top doctors:', error)
      toast.error('Failed to load top doctors')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: CHART_COLORS.primary }} />
      </div>
    )
  }

  // Generate harmonious colors for doctors
  const generateDoctorColor = (index: number) => {
    const baseColors = [
      CHART_COLORS.primary,
      CHART_COLORS.secondary,
      CHART_COLORS.accent,
      CHART_COLORS.success,
      '#93C5FD',
      '#7DD3C0',
      '#A5B4FC',
      '#BFDBFE',
    ]
    return baseColors[index % baseColors.length]
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 100, bottom: 10 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.muted} opacity={0.5} />
        <XAxis 
          type="number" 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          dataKey="doctorName" 
          type="category" 
          width={90}
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-1">{payload[0].payload.doctorName}</p>
                  <p className="text-sm text-gray-600 mb-2">{payload[0].payload.specialization}</p>
                  <p className="text-sm mb-1">Appointments: <span className="font-semibold">{payload[0].value}</span></p>
                  <p className="text-sm font-semibold" style={{ color: CHART_COLORS.success }}>
                    Revenue: ₹{payload[0].payload.totalRevenue.toLocaleString()}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="totalAppointments" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={generateDoctorColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
