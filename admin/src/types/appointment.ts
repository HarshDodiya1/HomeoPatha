/**
 * Appointment Types for Admin Panel
 */

export interface QuestionResponse {
  questionId: string;
  question: string;
  answer: string;
}

export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  specializationId: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    consultationFee: number;
  };
  questionResponses: QuestionResponse[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  prescription?: string;
  cancelledBy?: 'patient' | 'admin';
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
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  prescription?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  cancelReason?: string;
}
