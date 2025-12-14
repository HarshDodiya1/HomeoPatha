/**
 * Specializations Service for Admin Panel
 * API calls for managing specializations and appointment questions
 */

import apiClient from '@/lib/api/client';
import {
  Specialization,
  AppointmentQuestion,
  CreateSpecializationRequest,
  UpdateSpecializationRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  SpecializationsResponse,
  SpecializationDetailResponse,
  QuestionsResponse,
  QuestionDetailResponse,
} from '@/types/specialization';

const SPECIALIZATIONS_BASE_URL = '/api/admin/specializations';
const QUESTIONS_BASE_URL = '/api/admin/appointment-questions';

export const specializationsService = {
  // ============ Specializations ============

  /**
   * Get all specializations with pagination
   */
  getAllSpecializations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<SpecializationsResponse> => {
    const response = await apiClient.get<SpecializationsResponse>(
      SPECIALIZATIONS_BASE_URL,
      { params }
    );
    return response.data;
  },

  /**
   * Get specialization by ID
   */
  getSpecializationById: async (id: string): Promise<SpecializationDetailResponse> => {
    const response = await apiClient.get<SpecializationDetailResponse>(
      `${SPECIALIZATIONS_BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Create new specialization
   */
  createSpecialization: async (data: CreateSpecializationRequest): Promise<SpecializationDetailResponse> => {
    const response = await apiClient.post<SpecializationDetailResponse>(
      SPECIALIZATIONS_BASE_URL,
      data
    );
    return response.data;
  },

  /**
   * Update specialization
   */
  updateSpecialization: async (
    id: string,
    data: UpdateSpecializationRequest
  ): Promise<SpecializationDetailResponse> => {
    const response = await apiClient.put<SpecializationDetailResponse>(
      `${SPECIALIZATIONS_BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete specialization
   */
  deleteSpecialization: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${SPECIALIZATIONS_BASE_URL}/${id}`
    );
    return response.data;
  },

  // ============ Appointment Questions ============

  /**
   * Get all questions with optional filters
   */
  getAllQuestions: async (params?: {
    page?: number;
    limit?: number;
    specializationId?: string;
    isActive?: boolean;
  }): Promise<QuestionsResponse> => {
    const response = await apiClient.get<QuestionsResponse>(
      QUESTIONS_BASE_URL,
      { params }
    );
    return response.data;
  },

  /**
   * Get questions for a specific specialization (includes global questions)
   */
  getQuestionsBySpecialization: async (specializationId: string): Promise<QuestionsResponse> => {
    const response = await apiClient.get<QuestionsResponse>(
      QUESTIONS_BASE_URL,
      { params: { specializationId } }
    );
    return response.data;
  },

  /**
   * Get global questions only (no specialization)
   */
  getGlobalQuestions: async (): Promise<QuestionsResponse> => {
    const response = await apiClient.get<QuestionsResponse>(
      QUESTIONS_BASE_URL,
      { params: { specializationId: 'null' } }
    );
    return response.data;
  },

  /**
   * Get question by ID
   */
  getQuestionById: async (id: string): Promise<QuestionDetailResponse> => {
    const response = await apiClient.get<QuestionDetailResponse>(
      `${QUESTIONS_BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Create new question
   */
  createQuestion: async (data: CreateQuestionRequest): Promise<QuestionDetailResponse> => {
    const response = await apiClient.post<QuestionDetailResponse>(
      QUESTIONS_BASE_URL,
      data
    );
    return response.data;
  },

  /**
   * Update question
   */
  updateQuestion: async (
    id: string,
    data: UpdateQuestionRequest
  ): Promise<QuestionDetailResponse> => {
    const response = await apiClient.put<QuestionDetailResponse>(
      `${QUESTIONS_BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete question
   */
  deleteQuestion: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${QUESTIONS_BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Reorder questions
   */
  reorderQuestions: async (questionOrders: { questionId: string; order: number }[]): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `${QUESTIONS_BASE_URL}/reorder`,
      { questionOrders }
    );
    return response.data;
  },
};
