import axiosInstance, { noAuthInstance } from '../utils/axios';

export interface EventUser {
    PK: string; // USER#<ID>
    SK: string; // EVENT#<ID>

    id: string;

    // GSI attributes
    GSI2PK: string; // EVENT#<ID>
    GSI2SK: string; // USER#<ID>
}

export interface EventUserResponse {
    status: string;
    data: {
        userEvent: EventUser;
    };
}

export interface attendeesResponse {
    status: string;
    data: {
        attendees: EventUser[];
    };
}

export const attendEvent = async (orgId: string, eventId: string) => {
    try {
        const response = await axiosInstance.post<EventUserResponse>(
            `/organizations/${orgId}/events/${eventId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching attending event:', error);
        throw error;
    }
};

export const getEventAttendees = async (orgId: string, eventId: string) => {
    try {
        const response = await axiosInstance.get<attendeesResponse>(
            `/organizations/${orgId}/events/${eventId}`
        );
        return response.data.data.attendees;
    } catch (error) {
        console.error('Error fetching event attendees:', error);
        throw error;
    }
};
