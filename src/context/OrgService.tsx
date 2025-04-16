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
                limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching public organizations:', error);
        throw error;
    }
};

// Get public events for an organization
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

// Create a new organization
export const createOrganization = async (formData: FormData) => {
    try {
        const response = await axiosInstance.post('/organizations', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating organization:', error);
        throw error;
    }
};

// Create a new event for an organization
export const createEvent = async (orgId: string, eventData: { title: string; description: string; date: string }) => {
    try {
        const response = await axiosInstance.post(`/organizations/${orgId}/events`, eventData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error creating event for organization ${orgId}:`, error);
        throw error;
    }
};

// Update an existing organization
export const updateOrganization = async (organizationId: string, formData: FormData) => {
    try {
        const response = await axiosInstance.put(`/organizations/${organizationId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating organization ${organizationId}:`, error);
        throw error;
    }
};

// Delete an organization
export const deleteOrganization = async (organizationId: string) => {
    try {
        const response = await axiosInstance.delete(`/organizations/${organizationId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting organization ${organizationId}:`, error);
        throw error;
    }
};

// Get events for an organization (for authenticated users)
export const getOrganizationEvents = async (orgId: string) => {
    try {
        const response = await axiosInstance.get<EventsResponse>(`/organizations/${orgId}/events`);
        return response.data;
    } catch (error) {
        console.error('Error fetching organization events:', error);
        throw error;
    }
};

export const changeEventPublicity = async (orgId: string, eventId: string) => {
    try {
        const response = await axiosInstance.patch<EventsResponse>(
            `/organizations/${orgId}/events/${eventId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching organization events:', error);
        throw error;
    }
};

// Get user's own organizations
export const getUserOrganizations = async () => {
    try {
        const response = await axiosInstance.get('/organizations');
        return response.data;
    } catch (error) {
        console.error('Error fetching user organizations:', error);
        throw error;
    }
};