/**
 * Appointment Service
 * API calls for appointment management and payment processing
 */

import apiClient from '@/lib/api/client';
import {
  CreateAppointmentOrderRequest,
  CreateAppointmentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  Appointment,
} from '@/types/appointment';

const APPOINTMENT_BASE_URL = '/api/appointments';

export const appointmentService = {
  /**
   * Create Razorpay order for appointment booking
   * Now accepts specializationId and questionResponses
   */
  createAppointmentOrder: async (
    data: CreateAppointmentOrderRequest
  ): Promise<CreateAppointmentOrderResponse> => {
    const response = await apiClient.post<CreateAppointmentOrderResponse>(
      `${APPOINTMENT_BASE_URL}/create-order`,
      data
    );
    return response.data;
  },

  /**
   * Verify payment and confirm appointment
   */
  verifyPayment: async (
    data: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post<VerifyPaymentResponse>(
      `${APPOINTMENT_BASE_URL}/verify-payment`,
      data
    );
    return response.data;
  },

  /**
   * Get appointment details
   */
  getAppointmentDetails: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { appointment: Appointment };
    }>(`${APPOINTMENT_BASE_URL}/${appointmentId}`);
    return response.data.data.appointment;
  },

  /**
   * Get user's appointments
   */
  getUserAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { appointments: Appointment[] };
    }>('/api/users/appointments');
    return response.data.data.appointments;
  },

  /**
   * Cancel appointment
   */
  cancelAppointment: async (
    appointmentId: string,
    reason?: string
  ): Promise<void> => {
    await apiClient.post(`${APPOINTMENT_BASE_URL}/${appointmentId}/cancel`, {
      reason,
    });
  },
};
