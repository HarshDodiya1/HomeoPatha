/**
 * Form Validation Utilities
 * Common validation functions for forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate password
 */
export function validatePassword(
  password: string,
  minLength: number = 6
): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long`,
    };
  }

  return { isValid: true };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

/**
 * Validate username
 */
export function validateUsername(
  username: string,
  minLength: number = 3
): ValidationResult {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.trim().length < minLength) {
    return {
      isValid: false,
      error: `Username must be at least ${minLength} characters long`,
    };
  }

  // Allow alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username.trim())) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and special characters for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it contains only digits and optional leading +
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number',
    };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(
  value: string,
  fieldName: string = 'This field'
): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validate all login fields
 */
export function validateLoginForm(username: string, password: string): {
  isValid: boolean;
  errors: { username?: string; password?: string };
} {
  const errors: { username?: string; password?: string } = {};

  const usernameResult = validateRequired(username, 'Username');
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error;
  }

  const passwordResult = validateRequired(password, 'Password');
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate all registration fields
 */
export function validateRegistrationForm(data: {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): {
  isValid: boolean;
  errors: {
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  };
} {
  const errors: any = {};

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error;
  }

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.error;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  const confirmPasswordResult = validatePasswordConfirmation(
    data.password,
    data.confirmPassword
  );
  if (!confirmPasswordResult.isValid) {
    errors.confirmPassword = confirmPasswordResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
