import apiClient from '../api/client'
import { UpdateOrderStatusRequest, UpdatePaymentStatusRequest } from '@/types/order'

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
}
