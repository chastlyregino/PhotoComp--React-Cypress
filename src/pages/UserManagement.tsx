import { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Alert } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const UserManagement: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate password inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    // TODO: Implement actual password change functionality
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form fields after successful change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password successfully updated');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion');
      return;
    }
    
    try {
      // TODO: Implement actual account deletion functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Logout user after successful deletion
      authContext?.logout();
      
      // Redirect would happen here, but for now we'll just close the modal
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Account Settings</h1>
      
      {/* User Info Summary */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Account Information</Card.Title>
          <Row className="mt-3">
            <Col sm={3} className="fw-bold">Name:</Col>
            <Col sm={9}>{user?.firstName} {user?.lastName}</Col>
          </Row>
          <Row className="mt-2">
            <Col sm={3} className="fw-bold">Email:</Col>
            <Col sm={9}>{user?.email}</Col>
          </Row>
          <Row className="mt-2">
            <Col sm={3} className="fw-bold">Account Type:</Col>
            <Col sm={9}>{user?.role}</Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Change Password Section */}
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
            
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Delete Account Section */}
      <Card className="mb-4 border-danger">
        <Card.Body>
          <Card.Title className="text-danger">Delete Account</Card.Title>
          <Card.Text>
            Deleting your account is permanent and cannot be undone. All your data will be permanently removed.
          </Card.Text>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </Button>
        </Card.Body>
      </Card>
      
      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <p>To confirm, please type <strong>DELETE</strong> in the box below:</p>
          
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          
          <Form.Control
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="mb-3"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Confirm Deletion
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;