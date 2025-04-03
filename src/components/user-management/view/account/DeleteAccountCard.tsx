import React, { useState, useContext } from 'react';
import { Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import AuthContext from '../../../../context/AuthContext';
import { deleteAccount } from '../../api/userManagementApi';
import { validateDeleteConfirmation } from '../../utils/validators';
import { DeleteAccountCardProps } from '../../model/AccountModel';

/**
 * Component for handling account deletion functionality
 */
const DeleteAccountCard: React.FC<DeleteAccountCardProps> = ({ onDelete }) => {
  const authContext = useContext(AuthContext);
  
  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    
    const validationResult = validateDeleteConfirmation(deleteConfirmation);
    if (!validationResult.isValid) {
      setDeleteError(validationResult.errorMessage);
      return;
    }
    
    try {
      setIsDeleting(true);
      await deleteAccount();
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
      
      // Logout user after successful deletion
      authContext?.logout();
      
      // Modal will be automatically closed when user is redirected after logout
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
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
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteAccountCard;