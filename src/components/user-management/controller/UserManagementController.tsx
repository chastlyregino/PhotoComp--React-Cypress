import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useUserManagement from '../../../hooks/useUserManagement';
import useOrganizationManagement from '../../../hooks/useOrganizationManagement';
import UserManagementView from '../view/UserManagementView';
import { UserManagementTab } from '../model/UserManagementModel';

/**
 * Controller component for user management functionality
 * Manages state, business logic, and connects to custom hooks
 */
const UserManagementController: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<UserManagementTab>(UserManagementTab.PROFILE);
  
  // Custom hooks for user and organization management
  const { 
    user, 
    profileData, 
    isLoading, 
    error, 
    profileAttempted,
    hasProfileData,
    clearError, 
    refreshProfile 
  } = useUserManagement();
  
  const { refreshTrigger, refreshOrganizations } = useOrganizationManagement();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine if we should show an error
  // Only show the error if we've attempted to load the profile and failed
  const showError: boolean = !!(error && profileAttempted && !hasProfileData && !isLoading);
  
  // Handle tab change
  const handleTabChange = (tab: UserManagementTab) => {
    setActiveTab(tab);
  };

  return (
    <UserManagementView
      user={user}
      profileData={profileData}
      isLoading={isLoading}
      error={error}
      showError={showError}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onClearError={clearError}
      onRefreshProfile={refreshProfile}
      onRefreshOrganizations={refreshOrganizations}
      refreshTrigger={refreshTrigger}
      hasProfileData={hasProfileData}
    />
  );
};

export default UserManagementController;