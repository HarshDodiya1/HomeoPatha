import apiClient from '../api/client'
import { ContactMessageResponse, ContactMessageDetailResponse } from '@/types/contact'

export interface GetContactMessagesParams {
  page?: number
  limit?: number
  search?: string
  email?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const contactService = {
  // Get all contact messages with filters
  getAllMessages: async (params: GetContactMessagesParams = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.email) queryParams.append('email', params.email)
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await apiClient.get<ContactMessageResponse>(
      `/api/admin/contacts?${queryParams.toString()}`
    )
    return response.data
  },

  // Get specific contact message by ID
  getMessageById: async (id: string) => {
    const response = await apiClient.get<ContactMessageDetailResponse>(
      `/api/admin/contacts/${id}`
    )
    return response.data
  },

  // Delete contact message
  deleteMessage: async (id: string) => {
    const response = await apiClient.delete(`/api/admin/contacts/${id}`)
    return response.data
  },
}
