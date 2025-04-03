import React from 'react';
import UserManagement from '../components/user-management';

/**
 * User Management Page Component
 * Re-exports the UserManagement component from its MVC structure
 */
const UserManagementPage: React.FC = () => {
  return <UserManagement />;
};

export default UserManagementPage;