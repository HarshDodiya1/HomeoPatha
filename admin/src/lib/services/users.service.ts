/**
 * Users Service
 * API calls for user profile, orders, and appointments
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { User, UpdateProfileRequest, ChangePasswordRequest, ApiResponse } from '@/types/auth';

export interface UserProfile {
  user: User;
  stats: {
    totalOrders: number;
    totalAppointments: number;
  };
}

export interface Order {
  _id: string;
  userId: string;
  orderItems: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  consultationFee: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  prescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: {
    items: T[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export const usersService = {
  /**
   * Get user profile with stats
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.users.profile
    );
    return response.data.data!;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.users.profile,
      data
    );
    return response.data.data!;
  },

  /**
   * Get all user orders with pagination
   */
  async getOrders(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.users.orders,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Get specific order details
   */
  async getOrderDetail(orderId: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(
      API_ENDPOINTS.users.orderDetail(orderId)
    );
    return response.data.data!;
  },

  /**
   * Get all user appointments with pagination
   */
  async getAppointments(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<PaginatedResponse<Appointment>>(
      API_ENDPOINTS.users.appointments,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Get specific appointment details
   */
  async getAppointmentDetail(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.get<ApiResponse<Appointment>>(
      API_ENDPOINTS.users.appointmentDetail(appointmentId)
    );
    return response.data.data!;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      API_ENDPOINTS.auth.changePassword,
      data
    );
    return response.data;
  },
};
