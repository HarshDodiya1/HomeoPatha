/**
 * Site Settings Store
 * State management for hero images and sticky banners using Zustand
 */

import { create } from 'zustand';
import { siteSettingsService } from '@/lib/services/site-settings.service';
import {
  HeroImage,
  StickyBanner,
  CreateHeroImageRequest,
  UpdateHeroImageRequest,
  CreateStickyBannerRequest,
  UpdateStickyBannerRequest,
} from '@/types/site-settings';

interface SiteSettingsState {
  // Hero Images
  heroImages: HeroImage[];
  heroImagesLoading: boolean;
  heroImagesError: string | null;

  // Sticky Banners
  stickyBanners: StickyBanner[];
  stickyBannersLoading: boolean;
  stickyBannersError: string | null;

  // Hero Image Actions
  fetchHeroImages: () => Promise<void>;
  createHeroImage: (data: CreateHeroImageRequest) => Promise<void>;
  updateHeroImage: (id: string, data: UpdateHeroImageRequest) => Promise<void>;
  toggleHeroImage: (id: string) => Promise<void>;
  deleteHeroImage: (id: string) => Promise<void>;

  // Sticky Banner Actions
  fetchStickyBanners: () => Promise<void>;
  createStickyBanner: (data: CreateStickyBannerRequest) => Promise<void>;
  updateStickyBanner: (id: string, data: UpdateStickyBannerRequest) => Promise<void>;
  toggleStickyBanner: (id: string) => Promise<void>;
  deleteStickyBanner: (id: string) => Promise<void>;

  // Clear errors
  clearHeroImagesError: () => void;
  clearStickyBannersError: () => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  // Initial state
  heroImages: [],
  heroImagesLoading: false,
  heroImagesError: null,
  stickyBanners: [],
  stickyBannersLoading: false,
  stickyBannersError: null,

  // ==================== HERO IMAGES ====================

  fetchHeroImages: async () => {
    set({ heroImagesLoading: true, heroImagesError: null });
    try {
      const response = await siteSettingsService.getAllHeroImages();
      set({
        heroImages: response.data.heroImages,
        heroImagesLoading: false,
      });
    } catch (error: any) {
      set({
        heroImagesError: error.response?.data?.message || error.message || 'Failed to fetch hero images',
        heroImagesLoading: false,
      });
      throw error;
    }
  },

  createHeroImage: async (data: CreateHeroImageRequest) => {
    set({ heroImagesLoading: true, heroImagesError: null });
    try {
      await siteSettingsService.createHeroImage(data);
      set({ heroImagesLoading: false });
      await get().fetchHeroImages();
    } catch (error: any) {
      set({
        heroImagesError: error.response?.data?.message || error.message || 'Failed to create hero image',
        heroImagesLoading: false,
      });
      throw error;
    }
  },

  updateHeroImage: async (id: string, data: UpdateHeroImageRequest) => {
    set({ heroImagesLoading: true, heroImagesError: null });
    try {
      await siteSettingsService.updateHeroImage(id, data);
      set({ heroImagesLoading: false });
      await get().fetchHeroImages();
    } catch (error: any) {
      set({
        heroImagesError: error.response?.data?.message || error.message || 'Failed to update hero image',
        heroImagesLoading: false,
      });
      throw error;
    }
  },

  toggleHeroImage: async (id: string) => {
    // Optimistic update - immediately toggle in UI
    const currentImages = get().heroImages;
    const updatedImages = currentImages.map(img => 
      img._id === id ? { ...img, isActive: !img.isActive } : img
    );
    set({ heroImages: updatedImages, heroImagesError: null });
    
    try {
      await siteSettingsService.toggleHeroImage(id);
      // Refresh to ensure sync with server
      await get().fetchHeroImages();
    } catch (error: any) {
      // Revert on error
      set({ heroImages: currentImages });
      set({
        heroImagesError: error.response?.data?.message || error.message || 'Failed to toggle hero image',
      });
      throw error;
    }
  },

  deleteHeroImage: async (id: string) => {
    set({ heroImagesLoading: true, heroImagesError: null });
    try {
      await siteSettingsService.deleteHeroImage(id);
      set({ heroImagesLoading: false });
      await get().fetchHeroImages();
    } catch (error: any) {
      set({
        heroImagesError: error.response?.data?.message || error.message || 'Failed to delete hero image',
        heroImagesLoading: false,
      });
      throw error;
    }
  },

  // ==================== STICKY BANNERS ====================

  fetchStickyBanners: async () => {
    set({ stickyBannersLoading: true, stickyBannersError: null });
    try {
      const response = await siteSettingsService.getAllStickyBanners();
      set({
        stickyBanners: response.data.stickyBanners,
        stickyBannersLoading: false,
      });
    } catch (error: any) {
      set({
        stickyBannersError: error.response?.data?.message || error.message || 'Failed to fetch sticky banners',
        stickyBannersLoading: false,
      });
      throw error;
    }
  },

  createStickyBanner: async (data: CreateStickyBannerRequest) => {
    set({ stickyBannersLoading: true, stickyBannersError: null });
    try {
      await siteSettingsService.createStickyBanner(data);
      set({ stickyBannersLoading: false });
      await get().fetchStickyBanners();
    } catch (error: any) {
      set({
        stickyBannersError: error.response?.data?.message || error.message || 'Failed to create sticky banner',
        stickyBannersLoading: false,
      });
      throw error;
    }
  },

  updateStickyBanner: async (id: string, data: UpdateStickyBannerRequest) => {
    set({ stickyBannersLoading: true, stickyBannersError: null });
    try {
      await siteSettingsService.updateStickyBanner(id, data);
      set({ stickyBannersLoading: false });
      await get().fetchStickyBanners();
    } catch (error: any) {
      set({
        stickyBannersError: error.response?.data?.message || error.message || 'Failed to update sticky banner',
        stickyBannersLoading: false,
      });
      throw error;
    }
  },

  toggleStickyBanner: async (id: string) => {
    // Optimistic update - immediately toggle in UI
    // For sticky banners, if activating one, deactivate others
    const currentBanners = get().stickyBanners;
    const targetBanner = currentBanners.find(b => b._id === id);
    const willBeActive = targetBanner ? !targetBanner.isActive : false;
    
    const updatedBanners = currentBanners.map(banner => {
      if (banner._id === id) {
        return { ...banner, isActive: !banner.isActive };
      }
      // If activating this banner, deactivate others
      if (willBeActive) {
        return { ...banner, isActive: false };
      }
      return banner;
    });
    set({ stickyBanners: updatedBanners, stickyBannersError: null });
    
    try {
      await siteSettingsService.toggleStickyBanner(id);
      // Refresh to ensure sync with server
      await get().fetchStickyBanners();
    } catch (error: any) {
      // Revert on error
      set({ stickyBanners: currentBanners });
      set({
        stickyBannersError: error.response?.data?.message || error.message || 'Failed to toggle sticky banner',
      });
      throw error;
    }
  },

  deleteStickyBanner: async (id: string) => {
    set({ stickyBannersLoading: true, stickyBannersError: null });
    try {
      await siteSettingsService.deleteStickyBanner(id);
      set({ stickyBannersLoading: false });
      await get().fetchStickyBanners();
    } catch (error: any) {
      set({
        stickyBannersError: error.response?.data?.message || error.message || 'Failed to delete sticky banner',
        stickyBannersLoading: false,
      });
      throw error;
    }
  },

  // Clear errors
  clearHeroImagesError: () => set({ heroImagesError: null }),
  clearStickyBannersError: () => set({ stickyBannersError: null }),
}));
