import axiosInstance from '../utils/axios';


export interface Photo {
    PK: string;
    SK: string;
    id: string;
    eventId: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    uploadedBy: string;
    metadata?: {
        title?: string;
        description?: string;
        size?: number;
        mimeType?: string;
        s3Key?: string;
    };
    GSI2PK: string;
    GSI2SK: string;
}

export interface PhotosResponse {
    status: string;
    data: {
        photos: Photo[];
    };
}

export interface PhotoUploadResponse {
    status: string;
    data: {
        photo: Photo;
    };
}

/**
 * Gets all photos for an event
 * @param orgName The organization name
 * @param eventId The ID of the event
 * @returns Promise with the response data
 */
export const getAllPhotos = async (orgName: string, eventId: string): Promise<PhotosResponse> => {
    try {
        const response = await axiosInstance.get<PhotosResponse>(`/organizations/${orgName}/events/${eventId}/photos`);
        return response.data;
    } catch (error) {
        console.error('Error fetching photos of an event:', error);
        throw error;
    }
};

/**
 * Uploads a photo to an event
 * @param eventId The ID of the event
 * @param formData FormData containing the photo file and metadata
 * @returns Promise with the response data
 */
export const uploadEventPhoto = async (orgId: string, eventId: string, formData: FormData): Promise<PhotoUploadResponse> => {
    try {
        const response = await axiosInstance.post<PhotoUploadResponse>(
            `/organizations/${orgId}/events/${eventId}/photos`,

            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading photo to event:', error);
        throw error;
    }
};


