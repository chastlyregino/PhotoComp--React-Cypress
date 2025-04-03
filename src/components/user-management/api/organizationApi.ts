import axiosInstance from "../../../util/axios";
import { Organization, OrganizationCreateRequest } from "../model/OrganizationModel";

/**
 * API calls for organization management operations
 */

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