/**
 * Feedback Types
 * TypeScript interfaces for feedback/testimonial-related data structures
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

export interface CreateFeedbackRequest {
  quote: string;
  userName?: string;
  userRole?: string;
  stars: number;
  socialLinks?: SocialLinks;
  isPublished?: boolean;
}

export interface UpdateFeedbackRequest {
  quote?: string;
  userName?: string;
  userRole?: string;
  stars?: number;
  socialLinks?: SocialLinks;
  isPublished?: boolean;
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
    stats?: {
      totalFeedbacks: number;
      publishedFeedbacks: number;
      unpublishedFeedbacks: number;
      averageRating: number;
    };
  };
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    feedback: Feedback;
  };
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
  stars?: number;
  sortBy?: 'createdAt' | 'stars' | 'userName';
  sortOrder?: 'asc' | 'desc';
}
