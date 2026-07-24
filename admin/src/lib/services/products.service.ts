/**
 * Product Service
 * API calls for product operations
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { uploadImageToR2, uploadMultipleImagesToR2 } from './upload.service';
import {
  Product,
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
} from '@/types/product';

export const productService = {
  /**
   * Get all products with filters
   */
  async getAllProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(
      API_ENDPOINTS.admin.products.list,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(
      API_ENDPOINTS.admin.products.detail(id)
    );
    return response.data;
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    const response = await apiClient.post<ProductResponse>(
      API_ENDPOINTS.admin.products.create,
      data
    );
    return response.data;
  },

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse> {
    const response = await apiClient.put<ProductResponse>(
      API_ENDPOINTS.admin.products.update(id),
      data
    );
    return response.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.products.delete(id));
  },

  /**
   * Upload image to R2 (via backend)
   */
  async uploadImage(file: File): Promise<string> {
    return uploadImageToR2(file, 'products');
  },

  /**
   * Upload multiple images to R2 (via backend)
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    return uploadMultipleImagesToR2(files, 'products');
  },
};
