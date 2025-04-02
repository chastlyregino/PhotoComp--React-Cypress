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

export const changePassword = async (data: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
  const response = await axiosInstance.post("/api/users/change-password", data);
  return response.data;
};

export const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete("/api/users/account");
  return response.data;
};

export const getUserProfile = async (): Promise<any> => {
  const response = await axiosInstance.get("/api/users/");
  return response.data;
};