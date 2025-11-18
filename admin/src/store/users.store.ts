/**
 * Users Store
 * Zustand store for managing user profile, orders, and appointments
 * Updated for new Node.js backend API
 */

import { create } from 'zustand';
import { usersService, Order, Appointment, UserProfile } from '@/lib/services/users.service';
import { User, UserRoleEnum } from '@/types/auth';

interface UsersState {
  // Profile State
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  profileError: string | null;

  // Orders State
  orders: Order[];
  ordersPage: number;
  ordersTotal: number;
  isLoadingOrders: boolean;
  ordersError: string | null;

  // Appointments State
  appointments: Appointment[];
  appointmentsPage: number;
  appointmentsTotal: number;
  isLoadingAppointments: boolean;
  appointmentsError: string | null;

  // Users Management State
  allUsers: User[];
  filteredUsers: User[];
  isLoading: boolean;
  searchQuery: string;
  selectedUserType: 'ALL' | string;
  usersError: string | null;

  // Actions - Profile
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  
  // Actions - Orders
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  fetchOrderDetail: (orderId: string) => Promise<Order>;
  
  // Actions - Appointments
  fetchAppointments: (page?: number, limit?: number) => Promise<void>;
  fetchAppointmentDetail: (appointmentId: string) => Promise<Appointment>;
  changePassword: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  
  // Actions - Users Management
  fetchAllUsers: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedUserType: (type: 'ALL' | string) => void;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Error Management
  setProfileError: (error: string | null) => void;
  setOrdersError: (error: string | null) => void;
  setAppointmentsError: (error: string | null) => void;
  clearErrors: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state - Profile
  profile: null,
  isLoadingProfile: false,
  profileError: null,

  // Initial state - Orders
  orders: [],
  ordersPage: 1,
  ordersTotal: 0,
  isLoadingOrders: false,
  ordersError: null,

  // Initial state - Appointments
  appointments: [],
  appointmentsPage: 1,
  appointmentsTotal: 0,
  isLoadingAppointments: false,
  appointmentsError: null,

  // Initial state - Users Management
  allUsers: [],
  filteredUsers: [],
  isLoading: false,
  searchQuery: '',
  selectedUserType: 'ALL',
  usersError: null,

  // Fetch user profile
  fetchProfile: async () => {
    set({ isLoadingProfile: true, profileError: null });
    try {
      const profile = await usersService.getProfile();
      set({ profile, isLoadingProfile: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile';
      set({ profileError: errorMessage, isLoadingProfile: false });
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data: any) => {
    set({ isLoadingProfile: true, profileError: null });
    try {
      const updatedUser = await usersService.updateProfile(data);
      set((state) => ({
        profile: state.profile ? { ...state.profile, user: updatedUser } : null,
        isLoadingProfile: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      set({ profileError: errorMessage, isLoadingProfile: false });
      throw error;
    }
  },

  // Fetch orders
  fetchOrders: async (page = 1, limit = 10) => {
    set({ isLoadingOrders: true, ordersError: null });
    try {
      const response = await usersService.getOrders(page, limit);
      set({
        orders: response.data.items,
        ordersPage: page,
        ordersTotal: response.data.meta.totalItems,
        isLoadingOrders: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      set({ ordersError: errorMessage, isLoadingOrders: false });
      throw error;
    }
  },

  // Fetch order detail
  fetchOrderDetail: async (orderId: string) => {
    try {
      return await usersService.getOrderDetail(orderId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
      throw error;
    }
  },

  // Fetch appointments
  fetchAppointments: async (page = 1, limit = 10) => {
    set({ isLoadingAppointments: true, appointmentsError: null });
    try {
      const response = await usersService.getAppointments(page, limit);
      set({
        appointments: response.data.items,
        appointmentsPage: page,
        appointmentsTotal: response.data.meta.totalItems,
        isLoadingAppointments: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch appointments';
      set({ appointmentsError: errorMessage, isLoadingAppointments: false });
      throw error;
    }
  },

  // Fetch appointment detail
  fetchAppointmentDetail: async (appointmentId: string) => {
    try {
      return await usersService.getAppointmentDetail(appointmentId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch appointment';
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
    set({ profileError: null });
    try {
      await usersService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      set({ profileError: errorMessage });
      throw error;
    }
  },

  // Users Management - Fetch all users
  fetchAllUsers: async () => {
    set({ isLoading: true, usersError: null });
    try {
      // Mock data for now - replace with actual API call when available
      const mockUsers: User[] = [];
      set({ 
        allUsers: mockUsers, 
        filteredUsers: mockUsers,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      set({ usersError: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Users Management - Set search query and filter
  setSearchQuery: (query: string) => {
    set((state) => {
      const filtered = state.allUsers.filter((user) => {
        const matchesSearch =
          user.fullName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase());
        const matchesType = state.selectedUserType === 'ALL' || user.role === state.selectedUserType;
        return matchesSearch && matchesType;
      });
      return { searchQuery: query, filteredUsers: filtered };
    });
  },

  // Users Management - Set selected user type and filter
  setSelectedUserType: (type: 'ALL' | string) => {
    set((state) => {
      const filtered = state.allUsers.filter((user) => {
        const matchesSearch =
          user.fullName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesType = type === 'ALL' || user.role === type;
        return matchesSearch && matchesType;
      });
      return { selectedUserType: type, filteredUsers: filtered };
    });
  },

  // Users Management - Update user
  updateUser: async (id: string, data: any) => {
    set({ isLoading: true, usersError: null });
    try {
      // Mock implementation - replace with actual API call
      set((state) => ({
        allUsers: state.allUsers.map((user) =>
          user.id === id ? { ...user, ...data } : user
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      set({ usersError: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Users Management - Delete user
  deleteUser: async (id: string) => {
    set({ isLoading: true, usersError: null });
    try {
      // Mock implementation - replace with actual API call
      set((state) => ({
        allUsers: state.allUsers.filter((user) => user.id !== id),
        filteredUsers: state.filteredUsers.filter((user) => user.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      set({ usersError: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Set errors
  setProfileError: (error: string | null) => {
    set({ profileError: error });
  },

  setOrdersError: (error: string | null) => {
    set({ ordersError: error });
  },

  setAppointmentsError: (error: string | null) => {
    set({ appointmentsError: error });
  },

  clearErrors: () => {
    set({
      profileError: null,
      ordersError: null,
      appointmentsError: null,
    });
  },
}));
