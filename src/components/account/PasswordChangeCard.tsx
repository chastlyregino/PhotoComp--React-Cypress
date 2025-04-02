import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import PasswordInput from '../PasswordInput';
import { changePassword } from '../../api/userApi';
import { validatePasswordChange } from '../../util/validators';

/**
 * Component for handling password change functionality
 */
const PasswordChangeCard: React.FC = () => {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate password inputs
    const validationResult = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword
    );
    
    if (!validationResult.isValid) {
      setPasswordError(validationResult.errorMessage);
      return;
    }
    
    // Submit password change request
    try {
      setIsSubmitting(true);
      const response = await changePassword({
        currentPassword,
        newPassword,
      });
      
      // Clear form fields after successful change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password successfully updated');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Change Password</Card.Title>
        {passwordError && <Alert variant="danger">{passwordError}</Alert>}
        {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
        
        <Form onSubmit={handlePasswordChange}>
          <PasswordInput
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />
          
          <PasswordInput
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            helpText="Password must be at least 8 characters long."
          />
          
          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
          />
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PasswordChangeCard;