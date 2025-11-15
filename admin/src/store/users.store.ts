/**
 * Users Store
 * Zustand store for managing users state with filtering and search
 */

import { create } from 'zustand';
import { authService } from '@/lib/services/auth.service';
import { User, UserTypeEnum } from '@/types/auth';

interface UsersState {
  // State
  users: User[];
  filteredUsers: User[];
  doctors: User[];
  patients: User[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedUserType: UserTypeEnum | 'ALL';

  // Actions
  fetchAllUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<User>;
  updateUser: (
    id: string,
    data: {
      username?: string;
      email?: string;
      password?: string;
      user_type?: string;
    }
  ) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedUserType: (type: UserTypeEnum | 'ALL') => void;
  filterUsers: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  users: [],
  filteredUsers: [],
  doctors: [],
  patients: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedUserType: 'ALL',

  // Fetch all users
  fetchAllUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const users = await authService.getAllUsers();

      // Separate doctors and patients from the list
      const doctors = users.filter((u) => u.user_type === UserTypeEnum.DOCTOR);
      const patients = users.filter((u) => u.user_type === UserTypeEnum.PATIENT);

      set({
        users,
        doctors,
        patients,
        filteredUsers: users,
        isLoading: false,
      });

      // Apply current filters
      get().filterUsers();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to fetch users';

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: string) => {
    try {
      return await authService.getUserById(id);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to fetch user';

      set({ error: errorMessage });
      throw error;
    }
  },

  // Update user
  updateUser: async (
    id: string,
    data: {
      username?: string;
      email?: string;
      password?: string;
      user_type?: string;
    }
  ) => {
    try {
      const updatedUser = await authService.updateUser(id, data);

      // Update users list
      set((state) => {
        const updatedUsers = state.users.map((u) =>
          u.id === id ? updatedUser : u
        );

        return {
          users: updatedUsers,
          filteredUsers: state.filteredUsers.map((u) =>
            u.id === id ? updatedUser : u
          ),
        };
      });

      return updatedUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to update user';

      set({ error: errorMessage });
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string) => {
    try {
      await authService.deleteUser(id);

      // Remove from users list
      set((state) => {
        const updatedUsers = state.users.filter((u) => u.id !== id);
        const updatedFiltered = state.filteredUsers.filter((u) => u.id !== id);

        return {
          users: updatedUsers,
          filteredUsers: updatedFiltered,
          doctors: updatedUsers.filter((u) => u.user_type === UserTypeEnum.DOCTOR),
          patients: updatedUsers.filter((u) => u.user_type === UserTypeEnum.PATIENT),
        };
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to delete user';

      set({ error: errorMessage });
      throw error;
    }
  },

  // Set search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().filterUsers();
  },

  // Set selected user type filter
  setSelectedUserType: (type: UserTypeEnum | 'ALL') => {
    set({ selectedUserType: type });
    get().filterUsers();
  },

  // Filter users based on search query and user type
  filterUsers: () => {
    const { users, searchQuery, selectedUserType } = get();

    let filtered = [...users];

    // Filter by user type
    if (selectedUserType !== 'ALL') {
      filtered = filtered.filter((u) => u.user_type === selectedUserType);
    }

    // Filter by search query (username or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    set({ filteredUsers: filtered });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
