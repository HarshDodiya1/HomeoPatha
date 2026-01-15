/**
 * Blog Types for Client Website
 */

export interface BlogAuthorUser {
  _id: string;
  fullName: string;
  email?: string;
}

export interface BlogAuthor {
  _id: string;
  userId: BlogAuthorUser;
  qualification?: string;
  specialization?: string;
  images?: string[];
  experience?: number;
  about?: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string; // Only included in single blog detail
  coverImage: string;
  tags: string[];
  author: BlogAuthor | null;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface FeaturedBlogsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    blogs: Blog[];
  };
}
