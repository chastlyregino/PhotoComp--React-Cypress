import axiosInstance, { noAuthInstance } from '../utils/axios';

export interface Organization {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    PK: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    GSI1PK: string;
    GSI1SK: string;
    SK: string;
    createdBy: string;
    type: string;
}

export interface OrganizationsResponse {
    message: string;
    data: {
        organizations: Organization[];
    };
    lastEvaluatedKey: string | null;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    GSI2PK: string;
    GSI2SK: string;
    PK: string;
    SK: string;
    date: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
}

export interface EventsResponse {
    status: string;
    data: {
        events: Event[];
    };
    lastEvaluatedKey: string | null;
}

export const getPublicOrganizations = async (lastEvaluatedKey?: string, limit: number = 9) => {
  try {
    const response = await noAuthInstance.get<OrganizationsResponse>('/guests', {
      params: {
        lastEvaluatedKey: lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : undefined,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching public organizations:', error);
    throw error;
  }
};

export const getPublicOrganizationEvents = async (
    organizationId: string,
    lastEvaluatedKey?: string,
    limit: number = 9
) => {
    try {
        const response = await noAuthInstance.get<EventsResponse>(
            `/guests/organizations/${organizationId}/events`,
            {
                params: {
                    lastEvaluatedKey,
                    limit,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching events for organization ${organizationId}:`, error);
        throw error;
    }
};
