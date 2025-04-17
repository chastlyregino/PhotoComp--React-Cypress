import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicOrganizations, updateOrganization, Organization } from '../../context/OrgService';
import AuthContext from '../../context/AuthContext';
import * as icon from 'react-bootstrap-icons';

// Import components
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import { NavLink } from 'react-router-dom';

const OrganizationDetails: React.FC = () => {
    const { organizationId } = useParams<{ organizationId: string }>();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        contactEmail: '',
        website: '',
        logo: null as File | null
    });
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch organizations and find the specific one
    useEffect(() => {
        const fetchOrganization = async () => {
            if (!organizationId) return;
            
            try {
                setIsLoading(true);
                const response = await getPublicOrganizations();
                
                // Find the specific organization from the list
                const foundOrg = response.data.organizations.find(
                    (org: Organization) => org.id === organizationId
                );
                
                if (!foundOrg) {
                    setError('Organization not found');
                    return;
                }
                
                setOrganization(foundOrg);
                
                // Check if current user is admin of this organization
                // This logic will depend on your specific implementation
                setIsAdmin(user?.id === foundOrg.createdBy);
                
                // Initialize form data with current values
                setFormData({
                    description: foundOrg.description || '',
                    contactEmail: foundOrg.contactEmail || '',
                    website: foundOrg.website || '',
                    logo: null
                });
                
                // Set preview URL from existing logo
                if (foundOrg.logoUrl) {
                    setPreviewUrl(foundOrg.logoUrl);
                }
                
            } catch (err) {
                console.error('Error fetching organization details:', err);
                setError('Failed to load organization details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchOrganization();
    }, [organizationId, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Check file type
            if (!file.type.match('image.*')) {
                setError('Please select an image file');
                return;
            }
            
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should not exceed 5MB');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                logo: file
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!organizationId) return;
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            const updateData = new FormData();
            
            // Add all fields regardless if they're empty or not
            updateData.append('description', formData.description);
            updateData.append('contactEmail', formData.contactEmail);
            updateData.append('website', formData.website);
            
            if (formData.logo) {
                updateData.append('logo', formData.logo);
            }
            
            const response = await updateOrganization(organizationId, updateData);
            
            // Update the local state with the new data
            setOrganization(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    description: formData.description,
                    contactEmail: formData.contactEmail,
                    website: formData.website,
                    logoUrl: formData.logo ? URL.createObjectURL(formData.logo) : prev.logoUrl
                };
            });
            
            setSuccess('Organization updated successfully!');
            setIsEditing(false);
            
            // Refresh the organization data
            const refreshResponse = await getPublicOrganizations();
            const refreshedOrg = refreshResponse.data.organizations.find(
                (org: Organization) => org.id === organizationId
            );
            
            if (refreshedOrg) {
                setOrganization(refreshedOrg);
                setFormData({
                    description: refreshedOrg.description || '',
                    contactEmail: refreshedOrg.contactEmail || '',
                    website: refreshedOrg.website || '',
                    logo: null
                });
                
                if (refreshedOrg.logoUrl) {
                    setPreviewUrl(refreshedOrg.logoUrl);
                }
            }
            
        } catch (err) {
            console.error('Error updating organization:', err);
            setError('Failed to update organization. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle search logic here
    };

    // Search component for TopBar
    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search organizations..."
            className="ms-3"
        />
    );

    // Right components for TopBar
    const rightComponents = (
        <div className="d-flex align-items-center gap-3">
            {user ? (
                <>
                    <NavLink to="/account-settings" className="text-light top-bar-element">
                        <icon.GearFill size={24} />
                    </NavLink>
                    <NavLink to="/logout" className="text-light top-bar-element">
                        <icon.BoxArrowRight size={24} />
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink to="/register" className="btn btn-outline-light mx-1">
                        Register
                    </NavLink>
                    <NavLink to="/login" className="btn btn-outline-light">
                        Login
                    </NavLink>
                </>
            )}
        </div>
    );

    // Loading state
    if (isLoading) {
        return (
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <div className="sticky-top bg-dark z-3">
                        <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />
                    </div>
                    <Container fluid className="px-4 pt-4 bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
                        <Spinner animation="border" role="status" variant="light">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </Container>
                </Col>
            </Row>
        );
    }

    // Error state
    if (error && !organization) {
        return (
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <div className="sticky-top bg-dark z-3">
                        <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />
                    </div>
                    <Container fluid className="px-4 pt-4 bg-dark text-light min-vh-100">
                        <Alert variant="danger" className="my-4">
                            {error}
                        </Alert>
                        <Button variant="secondary" onClick={() => navigate('/organizations')}>
                            Back to Organizations
                        </Button>
                    </Container>
                </Col>
            </Row>
        );
    }

    return (
        <Row className="g-0">
            <Col md="auto" className="sidebar-container">
                <Sidebar />
            </Col>
            <Col className="main-content p-0">
                <div className="sticky-top bg-dark z-3">
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />
                </div>
                <Container fluid className="px-4 pt-4 bg-dark text-light min-vh-100">
                    {/* Success and Error Messages */}
                    {success && (
                        <Alert variant="success" className="my-3" dismissible onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}
                    
                    {error && (
                        <Alert variant="danger" className="my-3" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    
                    {organization && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h1 style={{ fontFamily: 'Michroma, sans-serif' }}>{organization.name}</h1>
                                
                                {isAdmin && !isEditing && (
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => setIsEditing(true)}
                                        className="py-2 px-3"
                                    >
                                        <icon.PencilSquare className="me-2" />
                                        Edit Organization
                                    </Button>
                                )}
                                
                                {isAdmin && isEditing && (
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={() => setIsEditing(false)}
                                        className="py-2 px-3"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            
                            <Row>
                                <Col md={4} className="mb-4">
                                    <Card className="bg-dark border-secondary">
                                        <Card.Body className="text-center">
                                            {previewUrl ? (
                                                <img 
                                                    src={previewUrl} 
                                                    alt={`${organization.name} logo`} 
                                                    className="img-fluid mb-3 rounded"
                                                    style={{ maxHeight: '200px' }}
                                                />
                                            ) : organization.logoUrl ? (
                                                <img 
                                                    src={organization.logoUrl} 
                                                    alt={`${organization.name} logo`} 
                                                    className="img-fluid mb-3 rounded"
                                                    style={{ maxHeight: '200px' }}
                                                />
                                            ) : (
                                                <div className="text-center p-5 bg-secondary rounded mb-3">
                                                    <icon.Building size={64} />
                                                    <p className="mt-2">No logo available</p>
                                                </div>
                                            )}
                                            
                                            {isAdmin && isEditing && (
                                                <Form.Group controlId="logo">
                                                    <Form.Label>Update Logo</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        name="logo"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="bg-dark text-light border-secondary"
                                                    />
                                                </Form.Group>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                
                                <Col md={8}>
                                    {isAdmin && isEditing ? (
                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group className="mb-3" controlId="description">
                                                <Form.Label style={{ fontFamily: 'Michroma, sans-serif' }}>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    className="bg-dark text-light border-secondary"
                                                    placeholder={organization.description || "Enter organization description"}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3" controlId="contactEmail">
                                                <Form.Label style={{ fontFamily: 'Michroma, sans-serif' }}>Contact Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="contactEmail"
                                                    value={formData.contactEmail}
                                                    onChange={handleInputChange}
                                                    className="bg-dark text-light border-secondary"
                                                    placeholder={organization.contactEmail || "Enter contact email"}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3" controlId="website">
                                                <Form.Label style={{ fontFamily: 'Michroma, sans-serif' }}>Website</Form.Label>
                                                <Form.Control
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    className="bg-dark text-light border-secondary"
                                                    placeholder={organization.website || "Enter website URL"}
                                                />
                                            </Form.Group>
                                            
                                            <div className="d-flex justify-content-end mt-4">
                                                <Button 
                                                    variant="secondary" 
                                                    type="submit" 
                                                    className="py-2 px-4"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="border"
                                                                size="sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                                className="me-2"
                                                            />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </Button>
                                            </div>
                                        </Form>
                                    ) : (
                                        <Card className="bg-dark border-secondary">
                                            <Card.Body>
                                                <h3 style={{ fontFamily: 'Michroma, sans-serif' }} className="mb-3">
                                                    Details
                                                </h3>
                                                
                                                <div className="mb-3">
                                                    <h5 style={{ fontFamily: 'Michroma, sans-serif' }}>Description</h5>
                                                    <p>{organization.description || 'No description available'}</p>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <h5 style={{ fontFamily: 'Michroma, sans-serif' }}>Contact Email</h5>
                                                    {organization.contactEmail ? (
                                                        <p>
                                                            <icon.Envelope className="me-2" />
                                                            <a href={`mailto:${organization.contactEmail}`} className="text-light">
                                                                {organization.contactEmail}
                                                            </a>
                                                        </p>
                                                    ) : (
                                                        <p>No contact email available</p>
                                                    )}
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <h5 style={{ fontFamily: 'Michroma, sans-serif' }}>Website</h5>
                                                    {organization.website ? (
                                                        <p>
                                                            <icon.Globe className="me-2" />
                                                            <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-light">
                                                                {organization.website}
                                                            </a>
                                                        </p>
                                                    ) : (
                                                        <p>No website available</p>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <h5 style={{ fontFamily: 'Michroma, sans-serif' }}>Created</h5>
                                                    <p>
                                                        <icon.Calendar className="me-2" />
                                                        {new Date(organization.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                            
                            <div className="mt-4">
                                <Button variant="outline-secondary" onClick={() => navigate('/organizations')}>
                                    Back to Organizations
                                </Button>
                            </div>
                        </>
                    )}
                </Container>
            </Col>
        </Row>
    );
};

export default OrganizationDetails;