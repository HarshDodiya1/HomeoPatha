/**
 * Validation helper functions for doctor routes
 */

// Phone number validation regex (supports international formats)
const PHONE_REGEX = /^[0-9]{7,15}$/;

/**
 * Validate update doctor profile input
 */
const validateUpdateDoctorProfile = (data) => {
  const errors = {};

  // Full Name validation (optional)
  if (data.fullName !== undefined) {
    if (typeof data.fullName !== "string") {
      errors.fullName = "Full name must be a string";
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long";
    } else if (data.fullName.trim().length > 100) {
      errors.fullName = "Full name must not exceed 100 characters";
    }
  }

  // Phone Number validation (optional)
  if (data.phoneNumber !== undefined) {
    if (typeof data.phoneNumber !== "string") {
      errors.phoneNumber = "Phone number must be a string";
    } else if (!PHONE_REGEX.test(data.phoneNumber.replace(/\D/g, ""))) {
      errors.phoneNumber =
        "Please provide a valid phone number (7-15 digits)";
    }
  }

  // Specialization validation (optional)
  if (data.specialization !== undefined) {
    if (typeof data.specialization !== "string") {
      errors.specialization = "Specialization must be a string";
    } else if (data.specialization.trim().length < 2) {
      errors.specialization = "Specialization must be at least 2 characters long";
    }
  }

  // Qualification validation (optional)
  if (data.qualification !== undefined) {
    if (typeof data.qualification !== "string") {
      errors.qualification = "Qualification must be a string";
    } else if (data.qualification.trim().length < 2) {
      errors.qualification = "Qualification must be at least 2 characters long";
    }
  }

  // Experience validation (optional)
  if (data.experience !== undefined) {
    if (typeof data.experience !== "number") {
      errors.experience = "Experience must be a number";
    } else if (data.experience < 0 || data.experience > 70) {
      errors.experience = "Experience must be between 0 and 70 years";
    }
  }

  // Consultation Fee validation (optional)
  if (data.consultationFee !== undefined) {
    if (typeof data.consultationFee !== "number") {
      errors.consultationFee = "Consultation fee must be a number";
    } else if (data.consultationFee < 0) {
      errors.consultationFee = "Consultation fee must be positive";
    }
  }

  // About validation (optional)
  if (data.about !== undefined) {
    if (typeof data.about !== "string") {
      errors.about = "About must be a string";
    } else if (data.about.trim().length > 1000) {
      errors.about = "About must not exceed 1000 characters";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate update appointment status
 */
const validateUpdateAppointmentStatus = (data) => {
  const errors = {};
  const validStatuses = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "rescheduled",
  ];

  // Status validation
  if (!data.status || typeof data.status !== "string") {
    errors.status = "Status is required and must be a string";
  } else if (!validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
  }

  // Notes validation (optional)
  if (data.notes !== undefined) {
    if (typeof data.notes !== "string") {
      errors.notes = "Notes must be a string";
    } else if (data.notes.trim().length > 1000) {
      errors.notes = "Notes must not exceed 1000 characters";
    }
  }

  // Prescription validation (optional)
  if (data.prescription !== undefined) {
    if (typeof data.prescription !== "string") {
      errors.prescription = "Prescription must be a string";
    } else if (data.prescription.trim().length > 2000) {
      errors.prescription = "Prescription must not exceed 2000 characters";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateUpdateDoctorProfile,
  validateUpdateAppointmentStatus,
};
