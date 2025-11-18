/**
 * Doctors Store
 * Zustand store for managing doctors and doctor-related state
 */

import { create } from 'zustand';
import { doctorsService, Doctor, DoctorProfile, Appointment } from '@/lib/services/doctors.service';

interface DoctorsState {
  // List State
  doctors: Doctor[];
  doctorsPage: number;
  doctorsTotal: number;
  isLoadingDoctors: boolean;
  doctorsError: string | null;
  doctorFilters: {
    specialization?: string;
    minRating?: number;
  };

  // Detail State
  selectedDoctor: DoctorProfile | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // My Profile State (for doctor user)
  myProfile: DoctorProfile | null;
  isLoadingMyProfile: boolean;
  myProfileError: string | null;

  // Appointments State
  appointments: Appointment[];
  appointmentsPage: number;
  appointmentsTotal: number;
  isLoadingAppointments: boolean;
  appointmentsError: string | null;

  // Actions
  fetchDoctors: (page?: number, limit?: number, filters?: any) => Promise<void>;
  fetchDoctorDetail: (doctorId: string) => Promise<void>;
  fetchMyProfile: () => Promise<void>;
  updateMyProfile: (data: any) => Promise<void>;
  fetchMyAppointments: (page?: number, limit?: number, status?: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, data: any) => Promise<Appointment>;
  setFilters: (filters: any) => void;

  // Error handling
  setDoctorsError: (error: string | null) => void;
  clearErrors: () => void;
}

export const useDoctorsStore = create<DoctorsState>((set, get) => ({
  // Initial state
  doctors: [],
  doctorsPage: 1,
  doctorsTotal: 0,
  isLoadingDoctors: false,
  doctorsError: null,
  doctorFilters: {},

  selectedDoctor: null,
  isLoadingDetail: false,
  detailError: null,

  myProfile: null,
  isLoadingMyProfile: false,
  myProfileError: null,

  appointments: [],
  appointmentsPage: 1,
  appointmentsTotal: 0,
  isLoadingAppointments: false,
  appointmentsError: null,

  // Fetch doctors list
  fetchDoctors: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoadingDoctors: true, doctorsError: null });
    try {
      const response = await doctorsService.getDoctors(page, limit, filters);
      const data = response.data || {};
      const doctors = (data.items || data.doctors || []) as Doctor[];
      const pagination = (data.meta || data.pagination || {}) as any;
      set({
        doctors: doctors,
        doctorsPage: page,
        doctorsTotal: pagination.totalItems || 0,
        isLoadingDoctors: false,
        doctorFilters: filters,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch doctors';
      set({ doctorsError: errorMessage, isLoadingDoctors: false });
      throw error;
    }
  },

  // Fetch doctor detail
  fetchDoctorDetail: async (doctorId: string) => {
    set({ isLoadingDetail: true, detailError: null });
    try {
      const doctor = await doctorsService.getDoctorDetail(doctorId);
      set({ selectedDoctor: doctor, isLoadingDetail: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch doctor';
      set({ detailError: errorMessage, isLoadingDetail: false });
      throw error;
    }
  },

  // Fetch my profile (for logged-in doctor)
  fetchMyProfile: async () => {
    set({ isLoadingMyProfile: true, myProfileError: null });
    try {
      const profile = await doctorsService.getDoctorProfile();
      set({ myProfile: profile, isLoadingMyProfile: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch profile';
      set({ myProfileError: errorMessage, isLoadingMyProfile: false });
      throw error;
    }
  },

  // Update my profile
  updateMyProfile: async (data: any) => {
    set({ isLoadingMyProfile: true, myProfileError: null });
    try {
      const profile = await doctorsService.updateDoctorProfile(data);
      set({ myProfile: profile, isLoadingMyProfile: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      set({ myProfileError: errorMessage, isLoadingMyProfile: false });
      throw error;
    }
  },

  // Fetch my appointments
  fetchMyAppointments: async (page = 1, limit = 10, status) => {
    set({ isLoadingAppointments: true, appointmentsError: null });
    try {
      const response = await doctorsService.getDoctorAppointments(page, limit, status);
      const data = (response.data || {}) as any;
      const appointments = (data.items || data.appointments || []) as Appointment[];
      const pagination = (data.meta || data.pagination || {}) as any;
      set({
        appointments: appointments,
        appointmentsPage: page,
        appointmentsTotal: pagination.totalItems || 0,
        isLoadingAppointments: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch appointments';
      set({ appointmentsError: errorMessage, isLoadingAppointments: false });
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, data: any) => {
    try {
      const updatedAppointment = await doctorsService.updateAppointmentStatus(appointmentId, data);
      
      // Update in local state
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a._id === appointmentId ? updatedAppointment : a
        ),
      }));

      return updatedAppointment;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update appointment';
      set({ appointmentsError: errorMessage });
      throw error;
    }
  },

  // Set filters
  setFilters: (filters: any) => {
    set({ doctorFilters: filters });
  },

  // Error handling
  setDoctorsError: (error: string | null) => {
    set({ doctorsError: error });
  },

  clearErrors: () => {
    set({
      doctorsError: null,
      detailError: null,
      myProfileError: null,
      appointmentsError: null,
    });
  },
}));
