/**
 * Site Settings Service
 * API calls for hero images and sticky banners
 */

import apiClient from '../api/client';
import { CLOUDINARY_CONFIG } from '../api/config';
import {
  HeroImage,
  StickyBanner,
  CreateHeroImageRequest,
  UpdateHeroImageRequest,
  CreateStickyBannerRequest,
  UpdateStickyBannerRequest,
  HeroImagesResponse,
  HeroImageResponse,
  StickyBannersResponse,
  StickyBannerResponse,
} from '@/types/site-settings';

const API_BASE = '/api/admin/site-settings';

export const siteSettingsService = {
  // ==================== HERO IMAGES ====================

  /**
   * Get all hero images
   */
  async getAllHeroImages(): Promise<HeroImagesResponse> {
    const response = await apiClient.get<HeroImagesResponse>(`${API_BASE}/hero-images`);
    return response.data;
  },

  /**
   * Create a hero image
   */
  async createHeroImage(data: CreateHeroImageRequest): Promise<HeroImageResponse> {
    const response = await apiClient.post<HeroImageResponse>(`${API_BASE}/hero-images`, data);
    return response.data;
  },

  /**
   * Update a hero image
   */
  async updateHeroImage(id: string, data: UpdateHeroImageRequest): Promise<HeroImageResponse> {
    const response = await apiClient.put<HeroImageResponse>(`${API_BASE}/hero-images/${id}`, data);
    return response.data;
  },

  /**
   * Toggle hero image active status
   */
  async toggleHeroImage(id: string): Promise<HeroImageResponse> {
    const response = await apiClient.patch<HeroImageResponse>(`${API_BASE}/hero-images/${id}/toggle`);
    return response.data;
  },

  /**
   * Delete a hero image
   */
  async deleteHeroImage(id: string): Promise<HeroImageResponse> {
    const response = await apiClient.delete<HeroImageResponse>(`${API_BASE}/hero-images/${id}`);
    return response.data;
  },

  // ==================== STICKY BANNERS ====================

  /**
   * Get all sticky banners
   */
  async getAllStickyBanners(): Promise<StickyBannersResponse> {
    const response = await apiClient.get<StickyBannersResponse>(`${API_BASE}/sticky-banners`);
    return response.data;
  },

  /**
   * Create a sticky banner
   */
  async createStickyBanner(data: CreateStickyBannerRequest): Promise<StickyBannerResponse> {
    const response = await apiClient.post<StickyBannerResponse>(`${API_BASE}/sticky-banners`, data);
    return response.data;
  },

  /**
   * Update a sticky banner
   */
  async updateStickyBanner(id: string, data: UpdateStickyBannerRequest): Promise<StickyBannerResponse> {
    const response = await apiClient.put<StickyBannerResponse>(`${API_BASE}/sticky-banners/${id}`, data);
    return response.data;
  },

  /**
   * Toggle sticky banner active status
   */
  async toggleStickyBanner(id: string): Promise<StickyBannerResponse> {
    const response = await apiClient.patch<StickyBannerResponse>(`${API_BASE}/sticky-banners/${id}/toggle`);
    return response.data;
  },

  /**
   * Delete a sticky banner
   */
  async deleteStickyBanner(id: string): Promise<StickyBannerResponse> {
    const response = await apiClient.delete<StickyBannerResponse>(`${API_BASE}/sticky-banners/${id}`);
    return response.data;
  },

  // ==================== IMAGE UPLOAD ====================

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

    const data = await response.json();
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
