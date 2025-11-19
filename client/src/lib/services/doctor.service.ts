import apiClient from '../api/client';
import { DoctorsResponse, DoctorDetailResponse } from '@/types/doctor';

export const doctorService = {
  // Get all doctors with filters
  getAllDoctors: async (params?: {
    page?: number;
    limit?: number;
    specialization?: string;
    minRating?: number;
  }): Promise<DoctorsResponse> => {
    const response = await apiClient.get<DoctorsResponse>('/api/doctors', { params });
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (id: string): Promise<DoctorDetailResponse> => {
    const response = await apiClient.get<DoctorDetailResponse>(`/api/doctors/${id}`);
    return response.data;
  },
};
