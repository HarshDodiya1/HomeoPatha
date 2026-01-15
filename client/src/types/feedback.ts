/**
 * Feedback/Testimonial Types
 * TypeScript interfaces for feedback-related data structures
 */

export interface SocialLinks {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
}

export interface Feedback {
  _id: string;
  quote: string;
  userName: string;
  userRole: string;
  stars: number;
  socialLinks?: SocialLinks;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbacksResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    feedbacks: Feedback[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalFeedbacks: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  minStars?: number;
  sortBy?: 'createdAt' | 'stars';
  sortOrder?: 'asc' | 'desc';
}
