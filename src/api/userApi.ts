import axiosInstance from "../util/axios";

/**
 * API calls for user account management operations
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface UserProfile {
  // Add specific fields based on your API response
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  // Add any additional fields from the profile data
  createdAt?: string;
  updatedAt?: string;
  settings?: Record<string, any>;
  // Add other fields as needed
}

/**
 * Changes the user's password
 * @param data Password change request data
 * @returns Response with success/failure info
 */
export const changePassword = async (data: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
  const response = await axiosInstance.post("/api/users/change-password", data);
  return response.data;
};

/**
 * Deletes the user's account
 * @returns Response with success/failure info
 */
export const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete("/api/users/account");
  return response.data;
};

/**
 * Fetches the user's profile data
 * @returns User profile data
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get("/api/users/");
  return response.data;
};