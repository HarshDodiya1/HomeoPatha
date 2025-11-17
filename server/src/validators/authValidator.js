/**
 * Validation helper functions for authentication
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number validation regex (supports international formats)
const PHONE_REGEX = /^[0-9]{7,15}$/;

// Password validation: minimum 8 characters, at least one uppercase, one lowercase, one number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Pincode validation: 5-6 digits
const PINCODE_REGEX = /^[0-9]{5,6}$/;

/**
 * Validate registration input
 */
const validateRegistration = (data) => {
  const errors = {};

  // Full Name validation
  if (!data.fullName || typeof data.fullName !== "string") {
    errors.fullName = "Full name is required and must be a string";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters long";
  } else if (data.fullName.trim().length > 100) {
    errors.fullName = "Full name must not exceed 100 characters";
  }

  // Email validation
  if (!data.email || typeof data.email !== "string") {
    errors.email = "Email is required and must be a string";
  } else if (!EMAIL_REGEX.test(data.email.toLowerCase())) {
    errors.email = "Please provide a valid email address";
  }

  // Password validation
  if (!data.password || typeof data.password !== "string") {
    errors.password = "Password is required and must be a string";
  } else if (!PASSWORD_REGEX.test(data.password)) {
    errors.password =
      "Password must be at least 8 characters and contain uppercase, lowercase, and number";
  }

  // Confirm Password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Phone Number validation
  if (!data.phoneNumber || typeof data.phoneNumber !== "string") {
    errors.phoneNumber = "Phone number is required and must be a string";
  } else if (!PHONE_REGEX.test(data.phoneNumber.replace(/\D/g, ""))) {
    errors.phoneNumber = "Please provide a valid phone number (7-15 digits)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login input
 */
const validateLogin = (data) => {
  const errors = {};

  // Email validation
  if (!data.email || typeof data.email !== "string") {
    errors.email = "Email is required and must be a string";
  } else if (!EMAIL_REGEX.test(data.email.toLowerCase())) {
    errors.email = "Please provide a valid email address";
  }

  // Password validation
  if (!data.password || typeof data.password !== "string") {
    errors.password = "Password is required and must be a string";
  } else if (data.password.length === 0) {
    errors.password = "Password cannot be empty";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate update profile input
 */
const validateUpdateProfile = (data) => {
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

  // Addresses validation (optional)
  if (data.addresses !== undefined) {
    if (!Array.isArray(data.addresses)) {
      errors.addresses = "Addresses must be an array";
    } else {
      data.addresses.forEach((addr, index) => {
        if (!addr.addressLine1 || typeof addr.addressLine1 !== "string") {
          errors[`address_${index}_addressLine1`] =
            "Address line 1 is required";
        }
        if (!addr.city || typeof addr.city !== "string") {
          errors[`address_${index}_city`] = "City is required";
        }
        if (!addr.state || typeof addr.state !== "string") {
          errors[`address_${index}_state`] = "State is required";
        }
        if (!addr.pincode || !PINCODE_REGEX.test(addr.pincode)) {
          errors[`address_${index}_pincode`] =
            "Valid pincode (5-6 digits) is required";
        }
      });
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate change password input
 */
const validateChangePassword = (data) => {
  const errors = {};

  // Current password validation
  if (!data.currentPassword || typeof data.currentPassword !== "string") {
    errors.currentPassword = "Current password is required";
  } else if (data.currentPassword.length === 0) {
    errors.currentPassword = "Current password cannot be empty";
  }

  // New password validation
  if (!data.newPassword || typeof data.newPassword !== "string") {
    errors.newPassword = "New password is required";
  } else if (!PASSWORD_REGEX.test(data.newPassword)) {
    errors.newPassword =
      "New password must be at least 8 characters and contain uppercase, lowercase, and number";
  }

  // Confirm new password validation
  if (!data.confirmNewPassword) {
    errors.confirmNewPassword = "Confirm new password is required";
  } else if (data.newPassword !== data.confirmNewPassword) {
    errors.confirmNewPassword = "New passwords do not match";
  }

  // Check if new password is different from current
  if (
    data.currentPassword &&
    data.newPassword &&
    data.currentPassword === data.newPassword
  ) {
    errors.newPassword =
      "New password must be different from current password";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
