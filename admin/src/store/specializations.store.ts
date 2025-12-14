/**
 * Specializations Store
 * Zustand store for managing specializations and appointment questions
 */

import { create } from 'zustand';
import { specializationsService } from '@/lib/services/specializations.service';
import {
  Specialization,
  AppointmentQuestion,
  CreateSpecializationRequest,
  UpdateSpecializationRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from '@/types/specialization';

interface SpecializationsState {
  // Specializations State
  specializations: Specialization[];
  isLoadingSpecializations: boolean;
  specializationsError: string | null;
  
  // Selected Specialization
  selectedSpecialization: Specialization | null;
  
  // Questions State
  questions: AppointmentQuestion[];
  isLoadingQuestions: boolean;
  questionsError: string | null;
  
  // Selected Question
  selectedQuestion: AppointmentQuestion | null;

  // Actions - Specializations
  fetchSpecializations: () => Promise<void>;
  fetchSpecializationById: (id: string) => Promise<Specialization>;
  createSpecialization: (data: CreateSpecializationRequest) => Promise<Specialization>;
  updateSpecialization: (id: string, data: UpdateSpecializationRequest) => Promise<Specialization>;
  deleteSpecialization: (id: string) => Promise<void>;
  setSelectedSpecialization: (specialization: Specialization | null) => void;

  // Actions - Questions
  fetchQuestions: (specializationId?: string) => Promise<void>;
  fetchQuestionById: (id: string) => Promise<AppointmentQuestion>;
  createQuestion: (data: CreateQuestionRequest) => Promise<AppointmentQuestion>;
  updateQuestion: (id: string, data: UpdateQuestionRequest) => Promise<AppointmentQuestion>;
  deleteQuestion: (id: string) => Promise<void>;
  reorderQuestions: (questionOrders: { questionId: string; order: number }[]) => Promise<void>;
  setSelectedQuestion: (question: AppointmentQuestion | null) => void;

  // Error handling
  clearErrors: () => void;
}

export const useSpecializationsStore = create<SpecializationsState>((set, get) => ({
  // Initial state
  specializations: [],
  isLoadingSpecializations: false,
  specializationsError: null,
  selectedSpecialization: null,
  
  questions: [],
  isLoadingQuestions: false,
  questionsError: null,
  selectedQuestion: null,

  // ============ Specializations Actions ============

  fetchSpecializations: async () => {
    set({ isLoadingSpecializations: true, specializationsError: null });
    try {
      const response = await specializationsService.getAllSpecializations({ limit: 100 });
      set({
        specializations: response.data.specializations || [],
        isLoadingSpecializations: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch specializations';
      set({ specializationsError: errorMessage, isLoadingSpecializations: false });
      throw error;
    }
  },

  fetchSpecializationById: async (id: string) => {
    try {
      const response = await specializationsService.getSpecializationById(id);
      return response.data.specialization;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch specialization';
      throw new Error(errorMessage);
    }
  },

  createSpecialization: async (data: CreateSpecializationRequest) => {
    try {
      const response = await specializationsService.createSpecialization(data);
      const newSpecialization = response.data.specialization;
      set((state) => ({
        specializations: [...state.specializations, newSpecialization],
      }));
      return newSpecialization;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create specialization';
      throw new Error(errorMessage);
    }
  },

  updateSpecialization: async (id: string, data: UpdateSpecializationRequest) => {
    try {
      const response = await specializationsService.updateSpecialization(id, data);
      const updatedSpecialization = response.data.specialization;
      set((state) => ({
        specializations: state.specializations.map((s) =>
          s._id === id ? updatedSpecialization : s
        ),
      }));
      return updatedSpecialization;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update specialization';
      throw new Error(errorMessage);
    }
  },

  deleteSpecialization: async (id: string) => {
    try {
      await specializationsService.deleteSpecialization(id);
      set((state) => ({
        specializations: state.specializations.filter((s) => s._id !== id),
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete specialization';
      throw new Error(errorMessage);
    }
  },

  setSelectedSpecialization: (specialization: Specialization | null) => {
    set({ selectedSpecialization: specialization });
  },

  // ============ Questions Actions ============

  fetchQuestions: async (specializationId?: string) => {
    set({ isLoadingQuestions: true, questionsError: null });
    try {
      const params: any = { limit: 100 };
      if (specializationId) {
        params.specializationId = specializationId;
      }
      const response = await specializationsService.getAllQuestions(params);
      set({
        questions: response.data.questions || [],
        isLoadingQuestions: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch questions';
      set({ questionsError: errorMessage, isLoadingQuestions: false });
      throw error;
    }
  },

  fetchQuestionById: async (id: string) => {
    try {
      const response = await specializationsService.getQuestionById(id);
      return response.data.question;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch question';
      throw new Error(errorMessage);
    }
  },

  createQuestion: async (data: CreateQuestionRequest) => {
    try {
      const response = await specializationsService.createQuestion(data);
      const newQuestion = response.data.question;
      set((state) => ({
        questions: [...state.questions, newQuestion],
      }));
      return newQuestion;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create question';
      throw new Error(errorMessage);
    }
  },

  updateQuestion: async (id: string, data: UpdateQuestionRequest) => {
    try {
      const response = await specializationsService.updateQuestion(id, data);
      const updatedQuestion = response.data.question;
      set((state) => ({
        questions: state.questions.map((q) =>
          q._id === id ? updatedQuestion : q
        ),
      }));
      return updatedQuestion;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update question';
      throw new Error(errorMessage);
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      await specializationsService.deleteQuestion(id);
      set((state) => ({
        questions: state.questions.filter((q) => q._id !== id),
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete question';
      throw new Error(errorMessage);
    }
  },

  reorderQuestions: async (questionOrders: { questionId: string; order: number }[]) => {
    try {
      await specializationsService.reorderQuestions(questionOrders);
      // Re-fetch to get updated order
      await get().fetchQuestions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reorder questions';
      throw new Error(errorMessage);
    }
  },

  setSelectedQuestion: (question: AppointmentQuestion | null) => {
    set({ selectedQuestion: question });
  },

  // ============ Error Handling ============

  clearErrors: () => {
    set({
      specializationsError: null,
      questionsError: null,
    });
  },
}));
