/**
 * Site Settings Service
 * API calls for hero images and sticky banners (public endpoints)
 */

import apiClient from '../api/client';

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

export interface HeroImagesResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    heroImages: HeroImage[];
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

export const siteSettingsService = {
  /**
   * Get active hero images for the carousel
   */
  async getActiveHeroImages(): Promise<HeroImagesResponse> {
    const response = await apiClient.get<HeroImagesResponse>('/api/site-settings/hero-images');
    return response.data;
  },

  /**
   * Get active sticky banner
   */
  async getActiveStickyBanner(): Promise<StickyBannerResponse> {
    const response = await apiClient.get<StickyBannerResponse>('/api/site-settings/sticky-banner');
    return response.data;
  },
};
