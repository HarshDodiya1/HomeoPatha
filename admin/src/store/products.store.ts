/**
 * Products Store
 * State management for products using Zustand
 */

import { create } from 'zustand';
import { productService } from '@/lib/services/products.service';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilters,
} from '@/types/product';

interface ProductsState {
  allProducts: Product[]; // All products from server
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  createProduct: (data: CreateProductRequest) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductRequest) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearError: () => void;
  resetCurrentProduct: () => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  allProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  fetchAllProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all products without pagination - use very high limit
      const response = await productService.getAllProducts({ limit: 10000, page: 1 });
      set({
        allProducts: response.data.products,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch products',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProductById(id);
      set({
        currentProduct: response.data.product,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch product',
        isLoading: false,
      });
      throw error;
    }
  },

  createProduct: async (data: CreateProductRequest) => {
    set({ isLoading: true, error: null });
    try {
      await productService.createProduct(data);
      set({ isLoading: false });
      // Refresh all products
      await get().fetchAllProducts();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create product',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id: string, data: UpdateProductRequest) => {
    set({ isLoading: true, error: null });
    try {
      await productService.updateProduct(id, data);
      set({ isLoading: false });
      // Refresh all products
      await get().fetchAllProducts();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update product',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await productService.deleteProduct(id);
      set({ isLoading: false });
      // Refresh all products
      await get().fetchAllProducts();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete product',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetCurrentProduct: () => {
    set({ currentProduct: null });
  },
}));
