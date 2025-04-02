import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { createOrganization, OrganizationCreateRequest } from '../../api/organizationApi';

interface CreateOrganizationCardProps {
  onCreationSuccess: () => void;
}

/**
 * Component for creating new organizations
 */
const CreateOrganizationCard: React.FC<CreateOrganizationCardProps> = ({ onCreationSuccess }) => {
  // Organization creation state
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the organization creation inputs
  const validateOrganizationInputs = (): boolean => {
    if (!name.trim()) {
      setError('Organization name is required');
      return false;
    }
    
    if (!logoUrl.trim()) {
      setError('Logo URL is required');
      return false;
    }
    
    // Simple URL validation
    try {
      new URL(logoUrl);
    } catch (e) {
      setError('Please enter a valid URL for the logo');
      return false;
    }
    
    return true;
  };

  // Handle organization creation form submission
  const handleCreateOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    
    // Validate inputs
    if (!validateOrganizationInputs()) {
      return;
    }
    
    // Submit organization creation request
    try {
      setIsSubmitting(true);
      
      const organizationData: OrganizationCreateRequest = {
        name,
        logoUrl
      };
      
      await createOrganization(organizationData);
      
      // Clear form fields after successful creation
      setName('');
      setLogoUrl('');
      setSuccess('Organization successfully created');
      
      // Notify parent component to refresh organizations list
      onCreationSuccess();
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.response?.data?.message || 'Failed to create organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Create New Organization</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleCreateOrganization}>
          <Form.Group className="mb-3" controlId="organizationName">
            <Form.Label>Organization Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              disabled={isSubmitting}
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="logoUrl">
            <Form.Label>Logo URL</Form.Label>
            <Form.Control
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Enter logo URL"
              disabled={isSubmitting}
            />
            <Form.Text className="text-muted">
              Provide a URL to the organization logo image
            </Form.Text>
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Organization'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateOrganizationCard;