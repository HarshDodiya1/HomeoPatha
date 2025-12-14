/**
 * Appointments Service for Admin Panel
 * API calls for managing appointments
 */

import apiClient from '@/lib/api/client';
import {
  AppointmentsResponse,
  AppointmentDetailResponse,
  UpdateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '@/types/appointment';

const APPOINTMENTS_BASE_URL = '/api/admin/appointments';

export const appointmentsService = {
  /**
   * Get all appointments with filtering and pagination
   */
  getAllAppointments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    specializationId?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AppointmentsResponse> => {
    const response = await apiClient.get<AppointmentsResponse>(
      APPOINTMENTS_BASE_URL,
      { params }
    );
    return response.data;
  },

  /**
   * Get appointment by ID
   */
  getAppointmentById: async (id: string): Promise<AppointmentDetailResponse> => {
    const response = await apiClient.get<AppointmentDetailResponse>(
      `${APPOINTMENTS_BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Update appointment
   */
  updateAppointment: async (
    id: string,
    data: UpdateAppointmentRequest
  ): Promise<AppointmentDetailResponse> => {
    const response = await apiClient.put<AppointmentDetailResponse>(
      `${APPOINTMENTS_BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Update appointment status
   */
  updateAppointmentStatus: async (
    id: string,
    data: UpdateAppointmentStatusRequest
  ): Promise<AppointmentDetailResponse> => {
    const response = await apiClient.put<AppointmentDetailResponse>(
      `${APPOINTMENTS_BASE_URL}/${id}/status`,
      data
    );
    return response.data;
  },

  /**
   * Delete appointment
   */
  deleteAppointment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${APPOINTMENTS_BASE_URL}/${id}`
    );
    return response.data;
  },
};
