export interface Doctor {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    addresses?: any[];
  };
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  about?: string;
  images: string[];
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorsResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    doctors: Doctor[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalDoctors: number;
      itemsPerPage: number;
    };
  };
}

export interface DoctorDetailResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    doctor: Doctor & {
      totalAppointments?: number;
    };
  };
}
