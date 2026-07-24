/**
 * Doctors Service
 * API calls for doctor profiles and related data
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { uploadImageToR2, uploadMultipleImagesToR2 } from './upload.service';
import { ApiResponse } from '@/types/auth';

export interface Doctor {
  id: string;
  _id?: string; // Add MongoDB _id field
  userId: string;
  user?: {
    fullName: string;
    email: string;
    phoneNumber: string;
    addresses?: any[];
  };
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  about?: string;
  images?: string[];
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
  images?: string[];
}

export interface CreateDoctorRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  about?: string;
  images?: string[];
}

export interface UpdateDoctorRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  about?: string;
  images?: string[];
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
    const response = await apiClient.get<any>(
      API_ENDPOINTS.doctors.list,
      {
        params: {
          page,
          limit,
          ...filters,
        },
      }
    );
    
    const responseData = response.data.data || {};
    const doctors = responseData.doctors || [];
    const pagination = responseData.pagination || {};
    
    return {
      success: response.data.success,
      message: response.data.message,
      code: response.data.code,
      data: {
        items: doctors,
        meta: {
          currentPage: pagination.currentPage || page,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.totalDoctors || 0,
          itemsPerPage: pagination.itemsPerPage || limit,
        },
      },
    };
  },

  /**
   * Get specific doctor details
   */
  async getDoctorDetail(doctorId: string): Promise<DoctorProfile> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.doctors.detail(doctorId)
    );
    return response.data.data.doctor;
  },

  /**
   * Get doctor's profile (for logged-in doctor)
   */
  async getDoctorProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.doctors.profile
    );
    return response.data.data.doctor;
  },

  /**
   * Update doctor profile
   */
  async updateDoctorProfile(data: UpdateDoctorProfileRequest): Promise<DoctorProfile> {
    const response = await apiClient.put<any>(
      API_ENDPOINTS.doctors.profile,
      data
    );
    return response.data.data.doctor;
  },

  /**
   * Get doctor's appointments with pagination
   */
  async getDoctorAppointments(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.doctors.appointments,
      {
        params: {
          page,
          limit,
          ...(status && { status }),
        },
      }
    );
    
    const responseData = response.data.data || {};
    const appointments = responseData.appointments || [];
    const pagination = responseData.pagination || {};
    
    return {
      success: response.data.success,
      message: response.data.message,
      code: response.data.code,
      data: {
        items: appointments,
        meta: {
          currentPage: pagination.currentPage || page,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.totalAppointments || 0,
          itemsPerPage: pagination.itemsPerPage || limit,
        },
      },
    };
  },

  /**
   * Get specific doctor appointment details
   */
  async getDoctorAppointmentDetail(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.doctors.appointmentDetail(appointmentId)
    );
    return response.data.data.appointment;
  },

  /**
   * Update appointment status and notes
   */
  async updateAppointmentStatus(
    appointmentId: string,
    data: UpdateAppointmentStatusRequest
  ): Promise<Appointment> {
    const response = await apiClient.put<any>(
      API_ENDPOINTS.doctors.updateAppointment(appointmentId),
      data
    );
    return response.data.data.appointment;
  },

  /**
   * Delete a doctor
   */
  async deleteDoctor(doctorId: string): Promise<void> {
    await apiClient.delete(`/api/doctors/${doctorId}`);
  },

  /**
   * Create a new doctor (Admin only)
   */
  async createDoctor(data: CreateDoctorRequest): Promise<Doctor> {
    const response = await apiClient.post<any>(
      '/api/admin/doctors',
      data
    );
    return response.data.data.doctor;
  },

  /**
   * Update doctor by ID (Admin only)
   */
  async updateDoctorById(doctorId: string, data: UpdateDoctorRequest): Promise<Doctor> {
    const response = await apiClient.put<any>(
      `/api/admin/doctors/${doctorId}`,
      data
    );
    return response.data.data.doctor;
  },

  /**
   * Delete doctor by ID (Admin only)
   */
  async deleteDoctorById(doctorId: string): Promise<void> {
    await apiClient.delete(`/api/admin/doctors/${doctorId}`);
  },

  /**
   * Upload image to R2 (via backend)
   */
  async uploadImage(file: File): Promise<string> {
    return uploadImageToR2(file, 'doctors');
  },

  /**
   * Upload multiple images to R2 (via backend)
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    return uploadMultipleImagesToR2(files, 'doctors');
  },
};
