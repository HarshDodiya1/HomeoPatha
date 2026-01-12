/**
 * Blogs Store
 * State management for blogs using Zustand
 */

import { create } from 'zustand';
import { blogService } from '@/lib/services/blogs.service';
import {
  Blog,
  CreateBlogRequest,
  UpdateBlogRequest,
} from '@/types/blog';

interface BlogsState {
  allBlogs: Blog[];
  currentBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
  };

  // Actions
  fetchAllBlogs: () => Promise<void>;
  fetchBlogById: (id: string) => Promise<void>;
  createBlog: (data: CreateBlogRequest) => Promise<void>;
  updateBlog: (id: string, data: UpdateBlogRequest) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  togglePublishStatus: (id: string) => Promise<void>;
  clearError: () => void;
  resetCurrentBlog: () => void;
}

export const useBlogsStore = create<BlogsState>((set, get) => ({
  allBlogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,
  stats: {
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
  },

  fetchAllBlogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await blogService.getAllBlogs({ limit: 10000, page: 1 });
      set({
        allBlogs: response.data.blogs,
        stats: response.data.stats || {
          totalBlogs: response.data.blogs.length,
          publishedBlogs: response.data.blogs.filter(b => b.published).length,
          draftBlogs: response.data.blogs.filter(b => !b.published).length,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch blogs',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchBlogById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await blogService.getBlogById(id);
      set({
        currentBlog: response.data.blog,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch blog',
        isLoading: false,
      });
      throw error;
    }
  },

  createBlog: async (data: CreateBlogRequest) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.createBlog(data);
      set({ isLoading: false });
      await get().fetchAllBlogs();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create blog',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBlog: async (id: string, data: UpdateBlogRequest) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.updateBlog(id, data);
      set({ isLoading: false });
      await get().fetchAllBlogs();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update blog',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBlog: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.deleteBlog(id);
      set({ isLoading: false });
      await get().fetchAllBlogs();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete blog',
        isLoading: false,
      });
      throw error;
    }
  },

  togglePublishStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.togglePublishStatus(id);
      set({ isLoading: false });
      await get().fetchAllBlogs();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to toggle publish status',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  resetCurrentBlog: () => set({ currentBlog: null }),
}));
