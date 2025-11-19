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
    };
    categories?: string[];
  };
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    product: Product;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  priceAtTime: number;
  _id: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    cart: Cart;
  };
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
