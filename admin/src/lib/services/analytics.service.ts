import apiClient from '../api/client'

export interface DashboardStats {
  appointments: {
    total: number
    thisMonth: number
    growth: number
    pending: number
    confirmed: number
  }
  patients: {
    total: number
    thisMonth: number
    growth: number
  }
  productsSold: {
    total: number
    thisMonth: number
    growth: number
  }
  revenue: {
    total: number
    thisMonth: number
    growth: number
    fromOrders: number
    fromAppointments: number
  }
  doctors: {
    total: number
  }
  orders: {
    total: number
  }
}

export interface RevenueData {
  date: string
  ordersRevenue: number
  ordersCount: number
  appointmentsRevenue: number
  appointmentsCount: number
  totalRevenue: number
}

export interface OrdersAnalytics {
  ordersByStatus: Array<{ _id: string; count: number; totalAmount: number }>
  paymentStatus: Array<{ _id: string; count: number; totalAmount: number }>
  paymentMethods: Array<{ _id: string; count: number; totalAmount: number }>
  topProducts: Array<{
    _id: string
    title: string
    totalQuantity: number
    totalRevenue: number
  }>
  recentOrders: any[]
}

export interface AppointmentsAnalytics {
  appointmentsByStatus: Array<{ _id: string; count: number }>
  appointmentsByPaymentStatus: Array<{
    _id: string
    count: number
    totalRevenue: number
  }>
  topDoctors: Array<{
    _id: string
    doctorName: string
    specialization: string
    totalAppointments: number
    totalRevenue: number
  }>
  appointmentsOverTime: Array<{ _id: string; count: number }>
  recentAppointments: any[]
}

export interface ProductsAnalytics {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  outOfStockProducts: number
  productsByCategory: Array<{ _id: string; count: number }>
  lowStockProducts: any[]
  averagePrice: number
}

export const analyticsService = {
  getDashboardStats: () =>
    apiClient.get<{
      success: boolean
      data: DashboardStats
    }>('/api/admin/analytics/dashboard-stats'),

  getRevenueAnalytics: (period: 'week' | 'month' | 'year' = 'month') =>
    apiClient.get<{
      success: boolean
      data: {
        period: string
        revenueData: RevenueData[]
      }
    }>('/api/admin/analytics/revenue', { params: { period } }),

  getOrdersAnalytics: () =>
    apiClient.get<{
      success: boolean
      data: OrdersAnalytics
    }>('/api/admin/analytics/orders'),

  getAppointmentsAnalytics: () =>
    apiClient.get<{
      success: boolean
      data: AppointmentsAnalytics
    }>('/api/admin/analytics/appointments'),

  getProductsAnalytics: () =>
    apiClient.get<{
      success: boolean
      data: ProductsAnalytics
    }>('/api/admin/analytics/products'),
}
