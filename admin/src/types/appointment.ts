/**
 * Appointment Types for Admin Panel
 */

export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  doctorId: {
    _id: string;
    userId: {
      _id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    specialization: string;
    consultationFee: number;
  };
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  consultationFee: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  notes?: string;
  prescription?: string;
  cancelledBy?: 'patient' | 'doctor' | 'admin';
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface AppointmentsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    appointments: Appointment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalAppointments: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats: AppointmentStats;
  };
}

export interface AppointmentDetailResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    appointment: Appointment;
  };
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  reason?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  consultationFee?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  prescription?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  cancelReason?: string;
}
