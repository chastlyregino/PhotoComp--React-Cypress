import axiosInstance from "../util/axios";

export const registerUser = async (data: {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}) => {
  return axiosInstance.post("/api/auth/register", data)
}

