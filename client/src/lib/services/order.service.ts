import apiClient from '../api/client'

export interface ShippingAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress
  paymentMethod: 'razorpay' | 'cod'
}

export interface VerifyOrderPaymentRequest {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export const orderService = {
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post('/api/orders/create-order', data),

  verifyPayment: (data: VerifyOrderPaymentRequest) =>
    apiClient.post('/api/orders/verify-payment', data),

  getOrders: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/api/orders', { params }),

  getOrderDetails: (id: string) =>
    apiClient.get(`/api/orders/${id}`),

  cancelOrder: (id: string) =>
    apiClient.put(`/api/orders/${id}/cancel`),
}
