import { ValidationResult } from '../model/AccountModel';

/**
 * Validation utilities for form handling in user management
 */

/**
 * Validates password change form fields
 */
export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): ValidationResult => {
  // Check if all fields are filled
  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      isValid: false,
      errorMessage: 'All password fields are required',
    };
  }

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return {
      isValid: false,
      errorMessage: 'New passwords do not match',
    };
  }

  // Check password length
  if (newPassword.length < 8) {
    return {
      isValid: false,
      errorMessage: 'New password must be at least 8 characters long',
    };
  }

  // Password is valid
  return {
    isValid: true,
    errorMessage: null,
  };
};

/**
 * Validates account deletion confirmation
 */
export const validateDeleteConfirmation = (confirmation: string): ValidationResult => {
  if (confirmation !== 'DELETE') {
    return {
      isValid: false,
      errorMessage: 'Please type DELETE to confirm account deletion',
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
};

/**
 * Validates organization creation inputs
 */
export const validateOrganizationInputs = (name: string, logoUrl: string): ValidationResult => {
  if (!name.trim()) {
    return {
      isValid: false,
      errorMessage: 'Organization name is required',
    };
  }
  
  if (!logoUrl.trim()) {
    return {
      isValid: false,
      errorMessage: 'Logo URL is required',
    };
  }
  
  // Simple URL validation
  try {
    new URL(logoUrl);
  } catch (e) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid URL for the logo',
    };
  }
  
  return {
    isValid: true,
    errorMessage: null,
  };
};