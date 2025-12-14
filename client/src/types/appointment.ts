/**
 * Appointment Types
 */

export interface QuestionResponseData {
  questionId: string;
  question: string;
  answer: string | string[] | number;
}

export interface PopulatedSpecialization {
  _id: string;
  name: string;
  description: string;
  consultationFee: number;
  imageUrl?: string | null;
  tags?: string[];
}

export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  specializationId: PopulatedSpecialization;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  questionResponses: QuestionResponseData[];
  prescription?: string;
  adminNotes?: string;
  cancelledBy?: 'patient' | 'admin';
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentOrderRequest {
  specializationId: string;
  questionResponses: {
    questionId: string;
    answer: string | string[] | number;
  }[];
}

export interface CreateAppointmentOrderResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    appointmentId: string;
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

export interface VerifyPaymentRequest {
  appointmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    appointment: Appointment;
  };
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
