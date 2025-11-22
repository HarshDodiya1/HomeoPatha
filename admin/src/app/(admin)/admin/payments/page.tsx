"use client"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { paymentService, PaymentAnalytics, Payment } from "@/lib/services/payment.service"
import { Loader2, DollarSign, CreditCard, ShoppingBag, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Bar, BarChart, Cell } from "recharts"

export default function PaymentsPage() {
  const { theme } = useTheme()
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<"all" | "order" | "appointment">("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const isDark = theme === 'dark'

  const CHART_COLORS = {
    primary: isDark ? '#f5f5f5' : '#1a1a1a',
    secondary: isDark ? '#d4d4d8' : '#4a4a4a',
    accent: isDark ? '#a1a1a1' : '#666666',
    gridStroke: isDark ? '#3f3f46' : '#e5e5e5',
    gridOpacity: isDark ? 0.3 : 1,
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [currentPage, filterType, filterStatus])

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true)
      const response = await paymentService.getPaymentAnalytics()
      setAnalytics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch payment analytics:', error)
      toast.error('Failed to load payment analytics')
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true)
      const response = await paymentService.getAllPayments({
        page: currentPage,
        limit: 20,
        type: filterType,
        paymentStatus: filterStatus === "all" ? undefined : filterStatus,
      })
      setPayments(response.data.data.payments)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-800 dark:text-neutral-200" />
      </div>
    )
  }

  const paymentTrendData = analytics?.paymentTrend.orders.map((order) => {
    const appointment = analytics.paymentTrend.appointments.find(a => a._id === order._id)
    return {
      date: order._id,
      orders: order.amount,
      appointments: appointment?.amount || 0,
      total: order.amount + (appointment?.amount || 0)
    }
  }) || []

  const statusDistribution = [
    ...(analytics?.paymentStatusDistribution.orders.map(item => ({
      name: `Orders: ${item._id}`,
      value: item.count,
      amount: item.totalAmount,
      type: 'order'
    })) || []),
    ...(analytics?.paymentStatusDistribution.appointments.map(item => ({
      name: `Appointments: ${item._id}`,
      value: item.count,
      amount: item.totalAmount,
      type: 'appointment'
    })) || [])
  ]

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-neutral-950">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">Payments</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Manage and track all payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-neutral-900 dark:border-l-neutral-100 bg-white dark:bg-neutral-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(analytics?.summary.totalPayments || 0)}</div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {analytics?.summary.totalTransactions || 0} transactions
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-neutral-700 dark:border-l-neutral-300 bg-white dark:bg-neutral-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Order Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(analytics?.summary.orderPayments.total || 0)}</div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {analytics?.summary.orderPayments.count || 0} orders
                </p>
              </div>
              <ShoppingBag className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-neutral-600 dark:border-l-neutral-400 bg-white dark:bg-neutral-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Appointment Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(analytics?.summary.appointmentPayments.total || 0)}</div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {analytics?.summary.appointmentPayments.count || 0} appointments
                </p>
              </div>
              <Calendar className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-neutral-500 dark:border-l-neutral-500 bg-white dark:bg-neutral-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Razorpay</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(analytics?.summary.orderPayments.razorpayAmount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">COD</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(analytics?.summary.orderPayments.codAmount || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-50">Payment Trends (Last 30 Days)</CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">Revenue from orders and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paymentTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridStroke} opacity={CHART_COLORS.gridOpacity} />
                <XAxis dataKey="date" stroke={CHART_COLORS.accent} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={CHART_COLORS.accent} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">{payload[0].payload.date}</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Orders: {formatCurrency(payload[0].payload.orders)}</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Appointments: {formatCurrency(payload[0].payload.appointments)}</p>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mt-1">Total: {formatCurrency(payload[0].payload.total)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="orders" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#ordersGradient)" strokeWidth={2} name="Orders" />
                <Area type="monotone" dataKey="appointments" stroke={CHART_COLORS.secondary} fillOpacity={1} fill="url(#appointmentsGradient)" strokeWidth={2} name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-neutral-50">Payment Status Distribution</CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">Breakdown by status and type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridStroke} opacity={CHART_COLORS.gridOpacity} />
                <XAxis dataKey="name" stroke={CHART_COLORS.accent} fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke={CHART_COLORS.accent} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{payload[0].payload.name}</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Count: {payload[0].value}</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Amount: {formatCurrency(payload[0].payload.amount)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'order' ? CHART_COLORS.primary : CHART_COLORS.secondary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="bg-white dark:bg-neutral-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-neutral-900 dark:text-neutral-50">All Payments</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">Complete list of payment transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => { setFilterType(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px] border-neutral-300 dark:border-neutral-700">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="order">Orders Only</SelectItem>
                  <SelectItem value="appointment">Appointments Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px] border-neutral-300 dark:border-neutral-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-800 dark:text-neutral-200" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Type</TableHead>
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Customer</TableHead>
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Amount</TableHead>
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Payment Method</TableHead>
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Status</TableHead>
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Details</TableHead>
                    <TableHead className="text-neutral-900 dark:text-neutral-50 font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment, index) => (
                      <TableRow 
                        key={payment._id}
                        className="border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <TableCell className="font-medium">
                          <Badge variant="outline" className={payment.type === 'order' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 border-neutral-300 dark:border-neutral-700' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 border-neutral-300 dark:border-neutral-700'}>
                            {payment.type === 'order' ? <ShoppingBag className="h-3 w-3 mr-1" /> : <Calendar className="h-3 w-3 mr-1" />}
                            {payment.type === 'order' ? 'Order' : 'Appointment'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-50">{payment.customer.name}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">{payment.customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge className={payment.paymentMethod === 'razorpay' ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-300' : 'bg-neutral-700 dark:bg-neutral-300 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-400'}>
                            {payment.paymentMethod === 'razorpay' ? 'Online' : 'COD'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              payment.paymentStatus === 'completed'
                                ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-300'
                                : payment.paymentStatus === 'pending'
                                ? 'bg-neutral-600 dark:bg-neutral-400 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-500'
                                : payment.paymentStatus === 'failed'
                                ? 'bg-neutral-700 dark:bg-neutral-300 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-400'
                                : 'bg-neutral-500 dark:bg-neutral-500 text-white dark:text-neutral-900 hover:bg-neutral-600 dark:hover:bg-neutral-600'
                            }
                          >
                            {payment.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">
                          {payment.type === 'order' ? (
                            <div>
                              <span className="font-medium text-neutral-900 dark:text-neutral-50">{payment.items} item(s)</span> • <span className="text-neutral-500 dark:text-neutral-400">{payment.orderStatus}</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-neutral-900 dark:text-neutral-50">Dr. {payment.doctor?.name}</span> • <span className="text-neutral-500 dark:text-neutral-400">{payment.appointmentStatus}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}