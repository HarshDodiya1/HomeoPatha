/**
 * Feedback Service
 * API calls for fetching public feedbacks/testimonials
 */

import apiClient from '../api/client';
import {
  FeedbacksResponse,
  FeedbackFilters,
} from '@/types/feedback';

const FEEDBACKS_BASE_URL = '/api/feedbacks';

export const feedbackService = {
  /**
   * Get all published feedbacks
   */
  async getPublishedFeedbacks(filters?: FeedbackFilters): Promise<FeedbacksResponse> {
    const response = await apiClient.get<FeedbacksResponse>(FEEDBACKS_BASE_URL, {
      params: filters,
    });
    return response.data;
  },
};
