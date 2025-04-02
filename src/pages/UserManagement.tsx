import React, { useContext } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';
import AccountInfoCard from '../components/account/AccountInfoCard';
import PasswordChangeCard from '../components/account/PasswordChangeCard';
import DeleteAccountCard from '../components/account/DeleteAccountCard';
import CreateOrganizationCard from '../components/organization/CreateOrganizationCard';
import OrganizationsListCard from '../components/organization/OrganizationsListCard';
import useOrganizationManagement from '../hooks/useOrganizationManagement';

/**
 * User account management page component
 * Contains various account-related features like viewing profile info,
 * changing password, organization management, and account deletion
 */
const UserManagement: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const { refreshTrigger, refreshOrganizations } = useOrganizationManagement();

  return (
    <Container className="py-5">
      <h1 className="mb-4">Account Settings</h1>
      
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
    </Container>
  );
};

export default UserManagement;