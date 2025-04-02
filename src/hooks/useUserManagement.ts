import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { getUserProfile } from '../api/userApi';

/**
 * Custom hook for user management-related functionality
 * Handles loading user profile data and other user management operations
 */
export function useUserManagement() {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  // Load additional profile data if needed
  const loadProfileData = async () => {
    if (!authContext?.user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    // Uncomment when backend API is ready
    // loadProfileData();
  }, [authContext?.user?.id]);

  return {
    user: authContext?.user,
    profileData,
    isLoading,
    error,
    refreshProfile: loadProfileData
  };
}

export default useUserManagement;