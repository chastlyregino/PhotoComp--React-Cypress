import axiosInstance, { noAuthInstance } from '../utils/axios';

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

export const getAllPhotos = async (orgName: string, eventId: string) => {
    try {
        const response = await axiosInstance.get<PhotosResponse>(`/organizations/${orgName}/events/${eventId}/photos`, {});
        console.log(`photos returned BE: ${response}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching photos of an event:', error);
        throw error;
    }
};
