import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { User } from '../../context/AuthContext';

interface AccountInfoCardProps {
    user: User | null | undefined; 
  }
  

/**
 * Displays user account information in a card format
 */
const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Account Information</Card.Title>
        <Row className="mt-3">
          <Col sm={3} className="fw-bold">Name:</Col>
          <Col sm={9}>{user.firstName} {user.lastName}</Col>
        </Row>
        <Row className="mt-2">
          <Col sm={3} className="fw-bold">Email:</Col>
          <Col sm={9}>{user.email}</Col>
        </Row>
        <Row className="mt-2">
          <Col sm={3} className="fw-bold">Account Type:</Col>
          <Col sm={9}>{user.role}</Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AccountInfoCard;