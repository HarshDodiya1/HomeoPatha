/**
 * Validation helper functions for user routes
 */

// Phone number validation regex (supports international formats)
const PHONE_REGEX = /^[0-9]{7,15}$/;

// Pincode validation: 5-6 digits
const PINCODE_REGEX = /^[0-9]{5,6}$/;

/**
 * Validate update user profile input
 */
const validateUpdateUserProfile = (data) => {
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
      const addressErrors = [];
      data.addresses.forEach((addr, index) => {
        const addrErr = {};

        if (!addr.addressLine1 || typeof addr.addressLine1 !== "string") {
          addrErr.addressLine1 = "Address line 1 is required";
        }
        if (!addr.city || typeof addr.city !== "string") {
          addrErr.city = "City is required";
        }
        if (!addr.state || typeof addr.state !== "string") {
          addrErr.state = "State is required";
        }
        if (!addr.pincode || !PINCODE_REGEX.test(addr.pincode)) {
          addrErr.pincode =
            "Valid pincode (5-6 digits) is required";
        }

        if (Object.keys(addrErr).length > 0) {
          addressErrors.push({
            index,
            errors: addrErr,
          });
        }
      });

      if (addressErrors.length > 0) {
        errors.addresses = addressErrors;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateUpdateUserProfile,
};
