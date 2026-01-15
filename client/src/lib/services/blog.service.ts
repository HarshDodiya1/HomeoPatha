/**
 * Blog Service
 * API calls for blog operations (public)
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { Blog, BlogsResponse, BlogResponse, FeaturedBlogsResponse } from '@/types/blog';

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  author?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const blogService = {
  /**
   * Get all published blogs with pagination
   */
  async getBlogs(filters: BlogFilters = {}): Promise<BlogsResponse> {
    const response = await apiClient.get<BlogsResponse>(
      API_ENDPOINTS.blogs.list,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get a single blog by ID
   */
  async getBlogById(id: string): Promise<BlogResponse> {
    const response = await apiClient.get<BlogResponse>(
      API_ENDPOINTS.blogs.detail(id)
    );
    return response.data;
  },

  /**
   * Get a single blog by slug
   */
  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    const response = await apiClient.get<BlogResponse>(
      API_ENDPOINTS.blogs.bySlug(slug)
    );
    return response.data;
  },

  /**
   * Get featured/recent blogs
   */
  async getFeaturedBlogs(limit: number = 5): Promise<FeaturedBlogsResponse> {
    const response = await apiClient.get<FeaturedBlogsResponse>(
      API_ENDPOINTS.blogs.featured,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get all unique tags
   */
  async getTags(): Promise<{ tag: string; count: number }[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: { tags: { tag: string; count: number }[] };
    }>(API_ENDPOINTS.blogs.tags);
    return response.data.data.tags;
  },
};
