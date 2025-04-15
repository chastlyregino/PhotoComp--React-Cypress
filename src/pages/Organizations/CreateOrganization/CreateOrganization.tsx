import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { createOrganization } from '../../../context/OrgService';

interface OrganizationData {
  name: string;
  logo: File | null;
}

const CreateOrganization: React.FC = () => {
  const navigate = useNavigate();
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: '',
    logo: null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrganizationData({
      ...organizationData,
      name: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      // Check file size (e.g., limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }

      setOrganizationData({
        ...organizationData,
        logo: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    if (!organizationData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!organizationData.logo) {
      setError('Organization logo is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('name', organizationData.name);
    
    if (organizationData.logo) {
      formData.append('logo', organizationData.logo);
    }
    
    try {
      // Make API call to create organization
      const response = await createOrganization(formData);
      console.log('Organization created successfully:', response);
      
      // Redirect to organizations page
      navigate('/organizations');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      
      // Handle specific error messages from the API
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create organization. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-organization-page bg-dark text-light min-vh-100">
      {/* Header with back button */}
      <div className="py-3 mb-4">
        <Container fluid>
          <Row className="align-items-center">
            <Col xs={12} className="d-flex align-items-center">
              <NavLink to="/organizations" className="text-light text-decoration-none">
                <ArrowLeft className="me-2" />
                Back to Organizations
              </NavLink>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="px-4">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <h1 className="text-center mb-5" style={{ fontFamily: 'Michroma, sans-serif' }}>Organizations</h1>
            
            <div className="text-center mb-5">
              <h2 className="fs-1" style={{ fontFamily: 'Michroma, sans-serif' }}>
                Start to create your Organization below!
              </h2>
            </div>

            {error && (
              <div className="alert alert-danger my-3" role="alert">
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="organizationName">
                <Form.Label style={{ fontFamily: 'Michroma, sans-serif' }} className="fs-4">
                  Organization Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter organization name"
                  value={organizationData.name}
                  onChange={handleNameChange}
                  className="bg-white border-secondary py-3"
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="organizationLogo">
                <Form.Label style={{ fontFamily: 'Michroma, sans-serif' }} className="fs-4">
                  Upload your Organization logo
                </Form.Label>
                
                {previewUrl && (
                  <div className="mb-3 text-center">
                    <img 
                      src={previewUrl} 
                      alt="Logo preview" 
                      style={{ maxHeight: '200px', maxWidth: '100%' }} 
                      className="border rounded"
                    />
                  </div>
                )}
                
                {/* File upload wrapper with controlled width */}
                <div>
                  <div style={{ width: '66.7%' }}> {/* This makes it 2/3 width */}
                    <Form.Control
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="bg-white text-dark border-secondary rounded-3"
                    />
                  </div>
                </div>
              </Form.Group>

              <div className="position-relative mt-5 pt-5">
                <div className="position-absolute start-0 ms-3">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/organizations')}
                    disabled={isSubmitting}
                    className="py-2 px-4"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="position-absolute end-0">
                  <Button
                    variant="secondary"
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2 px-4"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Organization'}
                  </Button>
                </div>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateOrganization;