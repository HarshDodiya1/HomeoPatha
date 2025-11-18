/**
 * Doctors Service
 * API calls for doctor profiles and related data
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { ApiResponse } from '@/types/auth';

export interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  about?: string;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile extends Doctor {
  user?: {
    fullName: string;
    email: string;
    phoneNumber: string;
    addresses?: any[];
  };
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

export interface UpdateDoctorProfileRequest {
  specialization?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  about?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  prescription?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  code: string;
  data: {
    doctors?: T[];
    items?: T[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    meta?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export const doctorsService = {
  /**
   * Get list of all doctors with optional filters
   */
  async getDoctors(
    page: number = 1,
    limit: number = 10,
    filters?: {
      specialization?: string;
      minRating?: number;
    }
  ): Promise<PaginatedResponse<Doctor>> {
    const response = await apiClient.get<PaginatedResponse<Doctor>>(
      API_ENDPOINTS.doctors.list,
      {
        params: {
          page,
          limit,
          ...filters,
        },
      }
    );
    // Ensure response data has the expected format
    const responseData = response.data.data || response.data;
    if (!responseData.items && responseData.doctors) {
      responseData.items = responseData.doctors;
    }
    if (!responseData.meta && responseData.pagination) {
      responseData.meta = responseData.pagination;
    }
    return response.data;
  },

  /**
   * Get specific doctor details
   */
  async getDoctorDetail(doctorId: string): Promise<DoctorProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      API_ENDPOINTS.doctors.detail(doctorId)
    );
    return response.data.data!;
  },

  /**
   * Get doctor's profile (for logged-in doctor)
   */
  async getDoctorProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get<ApiResponse<DoctorProfile>>(
      API_ENDPOINTS.doctors.profile
    );
    return response.data.data!;
  },

  /**
   * Update doctor profile
   */
  async updateDoctorProfile(data: UpdateDoctorProfileRequest): Promise<DoctorProfile> {
    const response = await apiClient.put<ApiResponse<DoctorProfile>>(
      API_ENDPOINTS.doctors.profile,
      data
    );
    return response.data.data!;
  },

  /**
   * Get doctor's appointments with pagination
   */
  async getDoctorAppointments(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<PaginatedResponse<Appointment>>(
      API_ENDPOINTS.doctors.appointments,
      {
        params: {
          page,
          limit,
          ...(status && { status }),
        },
      }
    );
    return response.data;
  },

  /**
   * Get specific doctor appointment details
   */
  async getDoctorAppointmentDetail(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.get<ApiResponse<Appointment>>(
      API_ENDPOINTS.doctors.appointmentDetail(appointmentId)
    );
    return response.data.data!;
  },

  /**
   * Update appointment status and notes
   */
  async updateAppointmentStatus(
    appointmentId: string,
    data: UpdateAppointmentStatusRequest
  ): Promise<Appointment> {
    const response = await apiClient.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.doctors.updateAppointment(appointmentId),
      data
    );
    return response.data.data!;
  },
};
