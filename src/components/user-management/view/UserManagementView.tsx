import React from 'react';
import { Container, Row, Col, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import { UserManagementTab, UserManagementViewProps } from '../model/UserManagementModel';

import AccountInfoCard from './account/AccountInfoCard';
import PasswordChangeCard from './account/PasswordChangeCard';
import DeleteAccountCard from './account/DeleteAccountCard';
import CreateOrganizationCard from './organization/CreateOrganizationCard';
import OrganizationsListCard from './organization/OrganizationsListCard';

/**
 * Presentation component for user management functionality
 * Responsible only for rendering UI based on provided props
 */
const UserManagementView: React.FC<UserManagementViewProps> = ({
  user,
  profileData,
  isLoading,
  error,
  showError,
  activeTab,
  onTabChange,
  onClearError,
  onRefreshProfile,
  onRefreshOrganizations,
  refreshTrigger,
  hasProfileData
}) => {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Account Settings</h1>
      
      {/* Display error when necessary */}
      {showError && (
        <Alert variant="danger" dismissible onClose={onClearError}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading profile data...</span>
          </Spinner>
        </div>
      ) : (
        <Tab.Container 
          id="user-management-tabs" 
          activeKey={activeTab}
          onSelect={(key) => onTabChange(key as UserManagementTab)}
        >
          <Row>
            <Col md={3} className="mb-4">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey={UserManagementTab.PROFILE}>Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={UserManagementTab.ORGANIZATIONS}>Organizations</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={UserManagementTab.SECURITY}>Security</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col md={9}>
              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey={UserManagementTab.PROFILE}>
                  <AccountInfoCard user={user} />
                  {hasProfileData && (
                    <Alert variant="info" className="mt-3">
                      Additional profile data loaded successfully!
                    </Alert>
                  )}
                </Tab.Pane>
                
                {/* Organizations Tab */}
                <Tab.Pane eventKey={UserManagementTab.ORGANIZATIONS}>
                  <CreateOrganizationCard onCreationSuccess={onRefreshOrganizations} />
                  <OrganizationsListCard refreshTrigger={refreshTrigger} />
                </Tab.Pane>
                
                {/* Security Tab */}
                <Tab.Pane eventKey={UserManagementTab.SECURITY}>
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

export default UserManagementView;