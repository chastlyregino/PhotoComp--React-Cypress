import React from 'react';
import { Container, Row, Col, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import AccountInfoCard from '../components/account/AccountInfoCard';
import PasswordChangeCard from '../components/account/PasswordChangeCard';
import DeleteAccountCard from '../components/account/DeleteAccountCard';
import CreateOrganizationCard from '../components/organization/CreateOrganizationCard';
import OrganizationsListCard from '../components/organization/OrganizationsListCard';
import useOrganizationManagement from '../hooks/useOrganizationManagement';
import useUserManagement from '../hooks/useUserManagement';

/**
 * User account management page component
 * Contains various account-related features like viewing profile info,
 * changing password, organization management, and account deletion
 */
const UserManagement: React.FC = () => {
  const { user, profileData, isLoading, error, refreshProfile } = useUserManagement();
  const { refreshTrigger, refreshOrganizations } = useOrganizationManagement();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Account Settings</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {isLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading profile data...</span>
          </Spinner>
        </div>
      ) : (
        <Tab.Container id="user-management-tabs" defaultActiveKey="profile">
          <Row>
            <Col md={3} className="mb-4">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="profile">Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="organizations">Organizations</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security">Security</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col md={9}>
              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey="profile">
                  <AccountInfoCard user={user} />
                  {profileData && (
                    <Alert variant="info" className="mt-3">
                      Additional profile data loaded successfully!
                    </Alert>
                  )}
                </Tab.Pane>
                
                {/* Organizations Tab */}
                <Tab.Pane eventKey="organizations">
                  <CreateOrganizationCard onCreationSuccess={refreshOrganizations} />
                  <OrganizationsListCard refreshTrigger={refreshTrigger} />
                </Tab.Pane>
                
                {/* Security Tab */}
                <Tab.Pane eventKey="security">
                  <PasswordChangeCard />
                  <DeleteAccountCard />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}
    </Container>
  );
};

export default UserManagement;