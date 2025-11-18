/**
 * Product Service
 * API calls for product operations
 */

import apiClient from '../api/client';
import { API_ENDPOINTS, CLOUDINARY_CONFIG } from '../api/config';
import {
  Product,
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
  CloudinaryUploadResponse,
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
   * Upload image to Cloudinary
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  },

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  },
};
