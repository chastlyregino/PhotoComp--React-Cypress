import { useState } from 'react';

/**
 * Custom hook for organization management
 * Provides state and functionality for organization operations
 */
export function useOrganizationManagement() {
  // Refresh trigger for organization list
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to trigger a refresh of the organizations list
  const refreshOrganizations = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    refreshTrigger,
    refreshOrganizations
  };
}

export default useOrganizationManagement;