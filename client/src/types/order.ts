export interface OrderItem {
  productId: string
  title: string
  quantity: number
  price: number
  image: string
  _id: string
}

export interface ShippingAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
}

export interface Order {
  _id: string
  userId: {
    _id: string
    fullName: string
    email: string
    phoneNumber: string
  }
  orderItems: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: 'razorpay' | 'cod'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentDetails?: {
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
  }
  shippingCharges: number
  totalAmount: number
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  estimatedDelivery?: string
  deliveredAt?: string
  adminNotes?: string
  confirmedAt?: string
  shippedAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  pendingPayments: number
}

export interface OrdersResponse {
  orders: Order[]
  stats: OrderStats
  pagination: {
    currentPage: number
    totalPages: number
    totalOrders: number
    itemsPerPage: number
  }
}
