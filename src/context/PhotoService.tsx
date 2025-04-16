<<<<<<< HEAD
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
=======
import axiosInstance from '../utils/axios';

export interface Photo {
  id: string;
  title?: string;
  description?: string;
  url: string;
  urls?: {
    original: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  uploadedBy: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
  };
}

export interface PhotosResponse {
  status: string;
  data: {
    photos: Photo[];
  };
  lastEvaluatedKey: string | null;
}

/**
 * Upload a photo to an event
 * @param eventId The event ID to upload the photo to
 * @param formData FormData containing photo file and optional title/description
 * @returns Promise with the upload response
 */
export const uploadEventPhoto = async (eventId: string, formData: FormData) => {
  try {
    const response = await axiosInstance.post(`/events/${eventId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading photo to event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get photos for an event
 * @param eventId The event ID to get photos for
 * @param lastEvaluatedKey Last evaluated key for pagination
 * @param limit Number of photos to return (default: 20)
 * @returns Promise with photos response
 */
export const getEventPhotos = async (
  eventId: string, 
  lastEvaluatedKey?: string, 
  limit: number = 20
) => {
  try {
    const response = await axiosInstance.get<PhotosResponse>(`/events/${eventId}/photos`, {
      params: {
        lastEvaluatedKey,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching photos for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Delete a photo
 * @param eventId Event ID the photo belongs to
 * @param photoId Photo ID to delete
 * @returns Promise with deletion response
 */
export const deletePhoto = async (eventId: string, photoId: string) => {
  try {
    const response = await axiosInstance.delete(`/events/${eventId}/photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting photo ${photoId} from event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get a download URL for a specific photo
 * @param eventId Event ID the photo belongs to
 * @param photoId Photo ID to download
 * @param size The size of the photo to download (original, thumbnail, medium, large)
 * @returns Promise with download URL response
 */
export const getPhotoDownloadUrl = async (
  eventId: string, 
  photoId: string,
  size: 'original' | 'thumbnail' | 'medium' | 'large' = 'original'
) => {
  try {
    const response = await axiosInstance.get(`/events/${eventId}/photos/${photoId}/download`, {
      params: { size }
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting download URL for photo ${photoId}:`, error);
    throw error;
  }
};

/**
 * Get all photos for an organization
 * @param orgId The organization ID to get photos for
 * @returns Promise with organization photos response
 */
export const getOrganizationPhotos = async (orgId: string) => {
  try {
    const response = await axiosInstance.get(`/organizations/${orgId}/photos`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching photos for organization ${orgId}:`, error);
    throw error;
  }
};

/**
 * Tag users in a photo
 * @param eventId Event ID the photo belongs to
 * @param photoId Photo ID to tag users in
 * @param userIds Array of user IDs to tag
 * @returns Promise with tagging response
 */
export const tagUsersInPhoto = async (eventId: string, photoId: string, userIds: string[]) => {
  try {
    const response = await axiosInstance.post(
      `/organizations/:id/events/${eventId}/photos/${photoId}/tags`,
      { userIds }
    );
    return response.data;
  } catch (error) {
    console.error(`Error tagging users in photo ${photoId}:`, error);
    throw error;
  }
};

/**
 * Remove a tag from a photo
 * @param eventId Event ID the photo belongs to
 * @param photoId Photo ID to remove tag from
 * @param userId User ID to untag
 * @returns Promise with untag response
 */
export const removePhotoTag = async (eventId: string, photoId: string, userId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/organizations/:id/events/${eventId}/photos/${photoId}/tags/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error removing tag for user ${userId} from photo ${photoId}:`, error);
    throw error;
  }
};

/**
 * Get all photos a user is tagged in
 * @param userId User ID to get tagged photos for
 * @returns Promise with tagged photos response
 */
export const getUserTaggedPhotos = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/tagged-photos`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tagged photos for user ${userId}:`, error);
    throw error;
  }
};
>>>>>>> fcfd646 (UploadPhoto)
