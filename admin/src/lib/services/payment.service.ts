import apiClient from '../api/client'

export interface PaymentSummary {
  totalPayments: number
  totalTransactions: number
  orderPayments: {
    total: number
    count: number
    razorpayCount: number
    codCount: number
    razorpayAmount: number
    codAmount: number
  }
  appointmentPayments: {
    total: number
    count: number
  }
}

export interface PaymentStatusItem {
  _id: string
  count: number
  totalAmount: number
}

export interface PaymentTrendItem {
  _id: string
  amount: number
  count: number
}

export interface PaymentAnalytics {
  summary: PaymentSummary
  paymentStatusDistribution: {
    orders: PaymentStatusItem[]
    appointments: PaymentStatusItem[]
  }
  paymentTrend: {
    orders: PaymentTrendItem[]
    appointments: PaymentTrendItem[]
  }
}

export interface Payment {
  _id: string
  type: "order" | "appointment"
  amount: number
  paymentStatus: string
  paymentMethod: string
  paymentDetails?: {
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
  }
  customer: {
    name: string
    email: string
  }
  doctor?: {
    name: string
    specialization: string
  }
  appointmentDate?: string
  appointmentTime?: string
  appointmentStatus?: string
  orderStatus?: string
  items?: number
  createdAt: string
  updatedAt: string
}

export interface PaymentListResponse {
  payments: Payment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export const paymentService = {
  getPaymentAnalytics: () => {
    return apiClient.get<{ data: PaymentAnalytics }>("/api/admin/payments/analytics")
  },

  getAllPayments: (params?: {
    page?: number
    limit?: number
    paymentStatus?: string
    type?: "order" | "appointment" | "all"
  }) => {
    return apiClient.get<{ data: PaymentListResponse }>("/api/admin/payments/list", { params })
  },
}
