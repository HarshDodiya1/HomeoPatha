/**
 * Blog Types
 * TypeScript interfaces for blog-related data structures
 */

// User info from populated userId
export interface BlogAuthorUser {
  _id: string;
  fullName: string;
  email?: string;
}

// Author (Doctor) type for blog - with userId populated
export interface BlogAuthor {
  _id: string;
  userId: BlogAuthorUser;
  qualification?: string;
  specialization?: string;
  images?: string[];
  experience?: number;
  about?: string;
  fullName: string;
}

export interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  author: BlogAuthor;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogRequest {
  title: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  author?: string; // Doctor ID
  published?: boolean;
}

export interface UpdateBlogRequest {
  title?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  author?: string | null;
  published?: boolean;
}

export interface BlogsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    blogs: Blog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBlogs: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats?: {
      totalBlogs: number;
      publishedBlogs: number;
      draftBlogs: number;
    };
  };
}

export interface BlogResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    blog: Blog;
  };
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  published?: boolean;
  author?: string;
  tag?: string;
  sortBy?: 'createdAt' | 'title' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}
