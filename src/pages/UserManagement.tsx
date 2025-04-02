import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import AccountInfoCard from '../components/account/AccountInfoCard';
import PasswordChangeCard from '../components/account/PasswordChangeCard';
import DeleteAccountCard from '../components/account/DeleteAccountCard';

/**
 * User account management page component
 * Contains various account-related features like viewing profile info,
 * changing password, and account deletion
 */
const UserManagement: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Account Settings</h1>
      
      {/* User Info Summary */}
      <AccountInfoCard user={user} />
      
      {/* Change Password Section */}
      <PasswordChangeCard />
      
      {/* Delete Account Section */}
      <DeleteAccountCard />
    </Container>
  );
};

export default UserManagement;