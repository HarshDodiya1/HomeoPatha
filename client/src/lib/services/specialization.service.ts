/**
 * Specialization Service
 * API calls for fetching specializations and questions
 */

import apiClient from '@/lib/api/client';
import {
  Specialization,
  AppointmentQuestion,
  SpecializationsResponse,
  SpecializationWithQuestionsResponse,
} from '@/types/specialization';

const SPECIALIZATION_BASE_URL = '/api/specializations';

export const specializationService = {
  /**
   * Get all active specializations
   */
  getSpecializations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<SpecializationsResponse> => {
    const response = await apiClient.get<SpecializationsResponse>(
      SPECIALIZATION_BASE_URL,
      { params }
    );
    return response.data;
  },

  /**
   * Get specialization by ID with associated questions
   */
  getSpecializationWithQuestions: async (
    id: string
  ): Promise<SpecializationWithQuestionsResponse> => {
    const response = await apiClient.get<SpecializationWithQuestionsResponse>(
      `${SPECIALIZATION_BASE_URL}/${id}`
    );
    return response.data;
  },
};
