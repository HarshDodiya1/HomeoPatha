/**
 * Blog Service
 * API calls for blog operations
 */

import apiClient from '../api/client';
import { uploadImageToR2 } from './upload.service';
import {
  Blog,
  BlogsResponse,
  BlogResponse,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogFilters,
} from '@/types/blog';

const BLOGS_BASE_URL = '/api/admin/blogs';

export const blogService = {
  /**
   * Get all blogs with filters
   */
  async getAllBlogs(filters?: BlogFilters): Promise<BlogsResponse> {
    const response = await apiClient.get<BlogsResponse>(BLOGS_BASE_URL, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get blog by ID
   */
  async getBlogById(id: string): Promise<BlogResponse> {
    const response = await apiClient.get<BlogResponse>(`${BLOGS_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new blog
   */
  async createBlog(data: CreateBlogRequest): Promise<BlogResponse> {
    const response = await apiClient.post<BlogResponse>(BLOGS_BASE_URL, data);
    return response.data;
  },

  /**
   * Update blog
   */
  async updateBlog(id: string, data: UpdateBlogRequest): Promise<BlogResponse> {
    const response = await apiClient.put<BlogResponse>(`${BLOGS_BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete blog
   */
  async deleteBlog(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${BLOGS_BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Toggle blog publish status
   */
  async togglePublishStatus(id: string): Promise<BlogResponse> {
    const response = await apiClient.put<BlogResponse>(
      `${BLOGS_BASE_URL}/${id}/toggle-publish`
    );
    return response.data;
  },

  /**
   * Upload image to R2 (via backend)
   */
  async uploadImage(file: File): Promise<string> {
    return uploadImageToR2(file, 'blogs');
  },
};
