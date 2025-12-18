/**
 * Site Settings Types
 */

export interface HeroImage {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface StickyBanner {
  _id: string;
  heading: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeroImageRequest {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateHeroImageRequest {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  order?: number;
}

export interface CreateStickyBannerRequest {
  heading: string;
  linkText?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface UpdateStickyBannerRequest {
  heading?: string;
  linkText?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface HeroImagesResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    heroImages: HeroImage[];
    total: number;
  };
}

export interface HeroImageResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    heroImage: HeroImage;
  };
}

export interface StickyBannersResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    stickyBanners: StickyBanner[];
    total: number;
  };
}

export interface StickyBannerResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    stickyBanner: StickyBanner | null;
  };
}
