/**
 * Specialization Types for Client
 */

export interface Specialization {
  _id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  consultationFee: number;
  tags: string[];
}

export interface AppointmentQuestion {
  _id: string;
  question: string;
  questionType: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  options: string[];
  isRequired: boolean;
  placeholder?: string;
  order: number;
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
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SpecializationWithQuestionsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    specialization: Specialization;
    questions: AppointmentQuestion[];
  };
}

export interface QuestionResponse {
  questionId: string;
  answer: string | string[] | number;
}
