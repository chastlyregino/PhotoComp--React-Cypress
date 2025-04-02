import axiosInstance from "../util/axios";

export interface OrganizationCreateRequest {
  name: string;
  logoUrl: string;
}

export interface Organization {
  GSI1PK: string;
  joinedAt: string;
  role: string;
  userId: string;
  SK: string;
  organizationName: string;
  GSI1SK: string;
  PK: string;
  type: string;
}

/**
 * Creates a new organization
 * @param data Organization creation data
 * @returns Response from API
 */
export const createOrganization = async (data: OrganizationCreateRequest): Promise<any> => {
  const response = await axiosInstance.post("/organizations", data);
  return response.data;
};

/**
 * Fetches all organizations for the current user
 * @returns List of organizations
 */
export const getUserOrganizations = async (): Promise<Organization[]> => {
  const response = await axiosInstance.get("/organizations");
  return response.data.org || [];
};