/**
 * Feedback Service
 * API calls for feedback/testimonial operations
 */

import apiClient from '../api/client';
import {
  Feedback,
  FeedbacksResponse,
  FeedbackResponse,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackFilters,
} from '@/types/feedback';

const FEEDBACKS_BASE_URL = '/api/admin/feedbacks';

export const feedbackService = {
  /**
   * Get all feedbacks with filters
   */
  async getAllFeedbacks(filters?: FeedbackFilters): Promise<FeedbacksResponse> {
    const response = await apiClient.get<FeedbacksResponse>(FEEDBACKS_BASE_URL, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get feedback by ID
   */
  async getFeedbackById(id: string): Promise<FeedbackResponse> {
    const response = await apiClient.get<FeedbackResponse>(`${FEEDBACKS_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new feedback
   */
  async createFeedback(data: CreateFeedbackRequest): Promise<FeedbackResponse> {
    const response = await apiClient.post<FeedbackResponse>(FEEDBACKS_BASE_URL, data);
    return response.data;
  },

  /**
   * Update feedback
   */
  async updateFeedback(id: string, data: UpdateFeedbackRequest): Promise<FeedbackResponse> {
    const response = await apiClient.put<FeedbackResponse>(`${FEEDBACKS_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete feedback
   */
  async deleteFeedback(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${FEEDBACKS_BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Toggle feedback publish status
   */
  async togglePublishStatus(id: string): Promise<FeedbackResponse> {
    const response = await apiClient.put<FeedbackResponse>(
      `${FEEDBACKS_BASE_URL}/${id}/toggle-publish`
    );
    return response.data;
  },
};
