/**
 * Models for Account Management functionality
 */

// Password change models
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
  }
  
  export interface PasswordChangeResponse {
    success: boolean;
    message: string;
  }
  
  // User profile model
  export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
    settings?: Record<string, any>;
  }
  
  // Component props for AccountInfoCard
  export interface AccountInfoCardProps {
    user: UserProfile | null | undefined;
  }
  
  // Component props for PasswordChangeCard
  export interface PasswordChangeCardProps {
    onSuccess?: () => void;
  }
  
  // Component props for DeleteAccountCard
  export interface DeleteAccountCardProps {
    onDelete?: () => void;
  }
  
  // Validation result interface
  export interface ValidationResult {
    isValid: boolean;
    errorMessage: string | null;
  }