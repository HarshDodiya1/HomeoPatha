import apiClient from '../api/client'
import { UpdateOrderStatusRequest, UpdatePaymentStatusRequest } from '@/types/order'

interface CreateManualOrderRequest {
  customerName: string
  customerEmail?: string
  customerPhone: string
  shippingAddress: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  billingDetails?: {
    accName?: string
    accNo?: string
    ifsc?: string
    branch?: string
    gstin?: string
  }
  orderItems: Array<{
    productId?: string
    title: string
    hsnCode?: string
    quantity: number
    price: number
    image?: string
    cgstRate?: number
    sgstRate?: number
  }>
  paymentMethod?: string
  paymentStatus?: string
  orderStatus?: string
  adminNotes?: string
  estimatedDelivery?: string
  shippingCharges?: number
}

export const ordersService = {
  getAllOrders: (params?: {
    page?: number
    limit?: number
    orderStatus?: string
    paymentStatus?: string
    paymentMethod?: string
    startDate?: string
    endDate?: string
    search?: string
  }) => apiClient.get('/api/admin/orders', { params }),

  getOrderById: (id: string) =>
    apiClient.get(`/api/admin/orders/${id}`),

  updateOrderStatus: (id: string, data: UpdateOrderStatusRequest) =>
    apiClient.put(`/api/admin/orders/${id}/status`, data),

  updatePaymentStatus: (id: string, data: UpdatePaymentStatusRequest) =>
    apiClient.put(`/api/admin/orders/${id}/payment-status`, data),

  deleteOrder: (id: string) =>
    apiClient.delete(`/api/admin/orders/${id}`),

  getOrderInvoice: (id: string) =>
    apiClient.get(`/api/admin/orders/${id}/invoice`, {
      responseType: 'text',
      headers: { Accept: 'text/html' },
    }),

  createManualOrder: (data: CreateManualOrderRequest) =>
    apiClient.post('/api/admin/orders/manual', data),
}
