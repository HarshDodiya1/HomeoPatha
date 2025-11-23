export interface ContactMessage {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface ContactMessageResponse {
  success: boolean
  message: string
  code: string
  data: {
    contactMessages: ContactMessage[]
    pagination: {
      currentPage: number
      totalPages: number
      totalMessages: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
    stats: {
      totalMessages: number
      messagesThisMonth: number
      messagesThisWeek: number
      messagesToday: number
    }
  }
}

export interface ContactMessageDetailResponse {
  success: boolean
  message: string
  code: string
  data: {
    contactMessage: ContactMessage
  }
}

export interface SubmitContactMessageRequest {
  fullName: string
  email: string
  phoneNumber: string
  message: string
}
