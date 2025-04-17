import axiosInstance from '../utils/axios';

export interface Photo {
    PK: string;
    SK: string;
    id: string;
    eventId: string;
    url: string;
    urls?: {
        original?: string;
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
    createdAt: string;
    updatedAt: string;
    uploadedBy: string;
    metadata?: {
        title?: string;
        description?: string;
        size?: number;
        width?: number;
        height?: number;
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
        const response = await axiosInstance.get<PhotosResponse>(
            `/organizations/${orgName}/events/${eventId}/photos`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching photos of an event:', error);
        throw error;
    }
};

/**
 * Uploads a photo to an event
 * @param orgId The organization ID
 * @param eventId The ID of the event
 * @param formData FormData containing the photo file and metadata
 * @returns Promise with the response data
 */
export const uploadEventPhoto = async (
    orgId: string,
    eventId: string,
    formData: FormData
): Promise<PhotoUploadResponse> => {
    try {
        const response = await axiosInstance.post<PhotoUploadResponse>(
            `/organizations/${orgId}/events/${eventId}/photos`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading photo to event:', error);
        throw error;
    }
};

/**
 * Gets a download URL for a specific photo
 * @param orgId The organization ID
 * @param eventId The ID of the event
 * @param photoId The ID of the photo
 * @param size The desired photo size
 * @returns Promise with the response data
 */
export const getPhotoDownloadUrl = async (
    orgId: string,
    eventId: string,
    photoId: string,
    size: 'thumbnail' | 'medium' | 'large' | 'original' = 'original'
): Promise<{ status: string; data: { downloadUrl: string; size: string } }> => {
    try {
        const response = await axiosInstance.get(
            `/organizations/${orgId}/events/${eventId}/photos/${photoId}/download`,
            { params: { size } }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting photo download URL:', error);
        throw error;
    }
};
