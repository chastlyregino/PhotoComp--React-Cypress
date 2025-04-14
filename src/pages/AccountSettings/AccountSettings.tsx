import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import NavButton from '../../components/navButton/NavButton';
import FormInput from '../../components/forms/FormInput/FormInput';

interface AccountSettingsProps {
  className?: string;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setError(null);
    
    try {
      // This will be implemented with actual API calls later
      console.log('Password change request:', { currentPassword, newPassword });
      
      // Mock success
      setSuccess('Password successfully updated');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to update password:', err);
      setError('Failed to update password. Please try again.');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'Delete') {
      setError('Please type "Delete" to confirm account deletion');
      return;
    }

    setError(null);
    
    try {
      // This will be implemented with actual API calls later
      console.log('Account deletion requested');
      
      // Log out and redirect
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError('Failed to delete account. Please try again.');
    }
  };

  // Cancel changes
  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeleteConfirmation('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={`account-settings bg-dark text-light min-vh-100 ${className}`}>
      {/* Header */}
      <div className="border-bottom border-secondary py-3">
        <Container fluid>
          <Row className="align-items-center">
            <Col xs={3} className="d-flex align-items-center">
              <NavButton to="/" variant="link" className="text-light text-decoration-none">
                <ArrowLeft className="me-2" />
                Back to Home
              </NavButton>
            </Col>
            <Col xs={6} className="text-center">
              <h2 className="mb-0">Account Settings</h2>
            </Col>
            <Col xs={3} className="text-end">
              {/* Placeholder for notifications or avatar */}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="py-5">
        {/* Account Info Section */}
        <Row className="justify-content-center mb-5">
          <Col xs={12} md={8} lg={6}>
            <h3 className="text-center mb-4">Personal Information</h3>
            
            {/* Display user information */}
            <div className="user-info mb-5">
              <p className="text-center mb-3">Account name: {user?.firstName} {user?.lastName}</p>
              <p className="text-center mb-3">Account Email: {user?.email}</p>
              <p className="text-center mb-5">Account Type: {user?.role || 'User'}</p>
            </div>

            {/* Password change form */}
            <Form onSubmit={handlePasswordChange}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <Form.Group className="mb-4" controlId="currentPassword">
                <Form.Label>Current Password:</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-dark border-secondary text-light"
                />
              </Form.Group>
              
              <Form.Group className="mb-4" controlId="newPassword">
                <Form.Label>New Password:</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-dark border-secondary text-light"
                />
              </Form.Group>
              
              <Form.Group className="mb-5" controlId="confirmPassword">
                <Form.Label>Confirm Password:</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-dark border-secondary text-light"
                />
              </Form.Group>
              
              <div className="d-flex justify-content-between mb-5">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>

            {/* Delete Account Section */}
            <div className="delete-account border-top border-secondary pt-4 mt-5">
              <h4 className="text-center text-danger mb-4">Delete Account?</h4>
              
              <Row className="align-items-center mb-3">
                <Col xs={12} md={6} className="text-md-end mb-3 mb-md-0">
                  <Form.Label htmlFor="deleteConfirmation">
                    Type "Delete" to confirm:
                  </Form.Label>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Control
                    id="deleteConfirmation"
                    type="text"
                    placeholder="Type 'Delete'"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="bg-dark border-secondary text-light"
                  />
                </Col>
              </Row>
              
              <div className="text-center mt-4">
                <Button 
                  variant="danger" 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'Delete'}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AccountSettings;