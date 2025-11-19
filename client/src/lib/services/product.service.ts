import apiClient from '../api/client';
import {
  Product,
  ProductsResponse,
  ProductDetailResponse,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@/types/product';

export const productService = {
  // Get all products with filters
  getAllProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    tags?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>('/api/products', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductDetailResponse> => {
    const response = await apiClient.get<ProductDetailResponse>(`/api/products/${id}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (
    category: string,
    params?: { page?: number; limit?: number }
  ): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>(`/api/products/category/${category}`, {
      params,
    });
    return response.data;
  },
};

export const cartService = {
  // Get cart
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get<CartResponse>('/api/products/cart');
    return response.data;
  },

  // Add to cart
  addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post<CartResponse>('/api/products/cart/items', data);
    return response.data;
  },

  // Update cart item
  updateCartItem: async (
    productId: string,
    data: UpdateCartItemRequest
  ): Promise<CartResponse> => {
    const response = await apiClient.put<CartResponse>(
      `/api/products/cart/items/${productId}`,
      data
    );
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const response = await apiClient.delete<CartResponse>(`/api/products/cart/items/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<CartResponse> => {
    const response = await apiClient.delete<CartResponse>('/api/products/cart');
    return response.data;
  },
};
