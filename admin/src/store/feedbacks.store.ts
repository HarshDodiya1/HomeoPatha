/**
 * Feedbacks Store
 * State management for feedbacks/testimonials using Zustand
 */

import { create } from 'zustand';
import { feedbackService } from '@/lib/services/feedbacks.service';
import {
  Feedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
} from '@/types/feedback';

interface FeedbacksState {
  allFeedbacks: Feedback[];
  currentFeedback: Feedback | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalFeedbacks: number;
    publishedFeedbacks: number;
    unpublishedFeedbacks: number;
    averageRating: number;
  };

  // Actions
  fetchAllFeedbacks: () => Promise<void>;
  fetchFeedbackById: (id: string) => Promise<void>;
  createFeedback: (data: CreateFeedbackRequest) => Promise<void>;
  updateFeedback: (id: string, data: UpdateFeedbackRequest) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
  clearError: () => void;
  resetCurrentFeedback: () => void;
}

export const useFeedbacksStore = create<FeedbacksState>((set, get) => ({
  allFeedbacks: [],
  currentFeedback: null,
  isLoading: false,
  error: null,
  stats: {
    totalFeedbacks: 0,
    publishedFeedbacks: 0,
    unpublishedFeedbacks: 0,
    averageRating: 0,
  },

  fetchAllFeedbacks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await feedbackService.getAllFeedbacks({ limit: 10000, page: 1 });
      set({
        allFeedbacks: response.data.feedbacks,
        stats: response.data.stats || {
          totalFeedbacks: response.data.feedbacks.length,
          publishedFeedbacks: response.data.feedbacks.filter(f => f.isPublished).length,
          unpublishedFeedbacks: response.data.feedbacks.filter(f => !f.isPublished).length,
          averageRating: response.data.feedbacks.length > 0 
            ? response.data.feedbacks.reduce((acc, f) => acc + f.stars, 0) / response.data.feedbacks.length 
            : 0,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch feedbacks',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchFeedbackById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await feedbackService.getFeedbackById(id);
      set({
        currentFeedback: response.data.feedback,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch feedback',
        isLoading: false,
      });
      throw error;
    }
  },

  createFeedback: async (data: CreateFeedbackRequest) => {
    set({ isLoading: true, error: null });
    try {
      await feedbackService.createFeedback(data);
      set({ isLoading: false });
      await get().fetchAllFeedbacks();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create feedback',
        isLoading: false,
      });
      throw error;
    }
  },

  updateFeedback: async (id: string, data: UpdateFeedbackRequest) => {
    set({ isLoading: true, error: null });
    try {
      await feedbackService.updateFeedback(id, data);
      set({ isLoading: false });
      await get().fetchAllFeedbacks();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update feedback',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteFeedback: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await feedbackService.deleteFeedback(id);
      set({ isLoading: false });
      await get().fetchAllFeedbacks();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete feedback',
        isLoading: false,
      });
      throw error;
    }
  },

  togglePublishStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await feedbackService.togglePublishStatus(id);
      set({ isLoading: false });
      await get().fetchAllFeedbacks();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to toggle publish status',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetCurrentFeedback: () => {
    set({ currentFeedback: null });
  },
}));
