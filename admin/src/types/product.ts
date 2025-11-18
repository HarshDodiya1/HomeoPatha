/**
 * Product Types
 * TypeScript interfaces for product-related data structures
 */

export interface Product {
  _id: string;
  title: string;
  category: string;
  description: string;
  badge?: string;
  rating: number;
  oldPrice?: number;
  currentPrice: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  title: string;
  category: string;
  description: string;
  badge?: string;
  rating?: number;
  oldPrice?: number;
  currentPrice: number;
  images: string[];
  tags: string[];
  isActive?: boolean;
}

export interface UpdateProductRequest {
  title?: string;
  category?: string;
  description?: string;
  badge?: string;
  rating?: number;
  oldPrice?: number;
  currentPrice?: number;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats?: {
      totalProducts: number;
      avgRating: number;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      activeProducts: number;
      inactiveProducts: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    product: Product;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'createdAt' | 'title' | 'currentPrice' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}
