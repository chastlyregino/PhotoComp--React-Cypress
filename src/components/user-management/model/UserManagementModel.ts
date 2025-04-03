/**
 * Models for User Management functionality
 */

// Tab identifiers for user settings
export enum UserManagementTab {
  PROFILE = 'profile',
  ORGANIZATIONS = 'organizations',
  SECURITY = 'security'
}

// Component props for UserManagementView
export interface UserManagementViewProps {
  // User data
  user: any;
  profileData: any;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  showError: boolean;
  
  // Tab functionality
  activeTab: UserManagementTab;
  onTabChange: (tab: UserManagementTab) => void;
  
  // Action handlers
  onClearError: () => void;
  onRefreshProfile: () => void;
  onRefreshOrganizations: () => void;
  refreshTrigger: number;
  
  // Data availability flags
  hasProfileData: boolean;
}