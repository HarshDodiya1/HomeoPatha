/**
 * Specialization Types for Admin Panel
 */

export interface Specialization {
  _id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  consultationFee: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Populated specialization reference from API
export interface PopulatedSpecializationRef {
  _id: string;
  name: string;
}

export interface AppointmentQuestion {
  _id: string;
  question: string;
  questionType: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  options: string[];
  isRequired: boolean;
  specializationId: string | PopulatedSpecializationRef | null;
  order: number;
  placeholder: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecializationRequest {
  name: string;
  description: string;
  imageUrl?: string | null;
  consultationFee: number;
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateSpecializationRequest {
  name?: string;
  description?: string;
  imageUrl?: string | null;
  consultationFee?: number;
  isActive?: boolean;
  tags?: string[];
}

export interface CreateQuestionRequest {
  question: string;
  questionType: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  options?: string[];
  isRequired?: boolean;
  specializationId?: string | null;
  order?: number;
  placeholder?: string;
  isActive?: boolean;
}

export interface UpdateQuestionRequest {
  question?: string;
  questionType?: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  options?: string[];
  isRequired?: boolean;
  specializationId?: string | null;
  order?: number;
  placeholder?: string;
  isActive?: boolean;
}

export interface SpecializationsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    specializations: Specialization[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSpecializations: number;
      itemsPerPage: number;
    };
  };
}

export interface SpecializationDetailResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    specialization: Specialization;
  };
}

export interface QuestionsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    questions: AppointmentQuestion[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalQuestions: number;
      itemsPerPage: number;
    };
  };
}

export interface QuestionDetailResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    question: AppointmentQuestion;
  };
}
