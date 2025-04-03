import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../../context/AuthContext';
import { getUserProfile } from '../api/userManagementApi';
import { UserProfile } from '../model/AccountModel';

/**
 * Custom hook for user management-related functionality
 * Handles loading user profile data and other user management operations
 */
export function useUserManagement() {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileAttempted, setProfileAttempted] = useState(false);

  // Load additional profile data if needed
  const loadProfileData = async () => {
    if (!authContext?.user || !authContext?.token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserProfile();
      setProfileData(data);
      // Indicate we've attempted to load the profile, whether successful or not
      setProfileAttempted(true);
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile data on component mount if user is authenticated
  useEffect(() => {
    if (authContext?.user?.id && authContext?.token) {
      loadProfileData();
    }
  }, [authContext?.user?.id, authContext?.token]);

  return {
    user: authContext?.user,
    profileData,
    isLoading,
    error,
    profileAttempted,
    hasProfileData: !!profileData,
    clearError: () => setError(null),
    refreshProfile: loadProfileData
  };
}

export default useUserManagement;