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
        attendees: string[]; // Array of user IDs from a format like 'USER#userId'
    };
}

/**
 * Attend an event - creates an attendance record
 * @param orgId Organization ID
 * @param eventId Event ID
 * @returns Response with created attendance record
 */
export const attendEvent = async (orgId: string, eventId: string) => {
    try {
        const response = await axiosInstance.post<EventUserResponse>(
            `/organizations/${orgId}/events/${eventId}`
        );
        console.log('Attend event response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error attending event:', error);
        throw error;
    }
};

/**
 * Get all attendees for an event
 * @param orgId Organization ID
 * @param eventId Event ID
 * @returns Array of user IDs for attendees
 */
export const getEventAttendees = async (
    orgId: string,
    eventId: string
): Promise<EventUser[] | undefined> => {
    try {
        // Try using the proper endpoint first
        try {
            console.log(`Fetching attendees for event ${eventId} in org ${orgId}`);
            const response = await axiosInstance.get<attendeesResponse>(
                `/organizations/${orgId}/events/${eventId}`
            );

            console.log('Event attendees response:', response.data);

            // Check different possible response formats
            if (
                response.data &&
                response.data.data &&
                Array.isArray(response.data.data.attendees)
            ) {
                return response.data.data.attendees as unknown as EventUser[];
            }
        } catch (error) {
            console.warn('Error using primary attendees endpoint, trying fallback:', error);
        }

        // Fallback: try to get event users from the event itself
        const eventResponse = await axiosInstance.get(
            `/organizations/${orgId}/events/${eventId}/users`
        );

        // Try to extract event users from different possible response structures
        if (eventResponse.data && eventResponse.data.data && eventResponse.data.data.users) {
            return eventResponse.data.data.users
                .map((user: any) => {
                    if (typeof user === 'string') return user;
                    if (user.userId) return user.userId;
                    if (user.id) return user.id;
                    return '';
                })
                .filter(Boolean);
        }

        // Last resort: If we can't find attendees through any API, try to get them from GSIs
        const indexResponse = await axiosInstance.get(
            `/organizations/${orgId}/events/${eventId}/gsi`
        );

        if (indexResponse.data && indexResponse.data.items) {
            return indexResponse.data.items
                .filter((item: any) => item.PK && item.PK.startsWith('USER#'))
                .map((item: any) => item.PK);
        }

        // If everything fails, return empty array
        console.warn('No attendees found for this event using any endpoint');
        return [];
    } catch (error) {
        console.error('Error fetching event attendees:', error);
        return []; // Return empty array on error
    }
};
