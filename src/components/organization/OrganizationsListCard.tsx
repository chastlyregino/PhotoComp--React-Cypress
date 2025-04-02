import React, { useState, useEffect } from 'react';
import { Card, Table, Pagination, Alert, Spinner, Badge } from 'react-bootstrap';
import { getUserOrganizations, Organization } from '../../api/organizationApi';

interface OrganizationsListCardProps {
  refreshTrigger: number;
}

/**
 * Component for displaying user's organizations with pagination
 */
const OrganizationsListCard: React.FC<OrganizationsListCardProps> = ({ refreshTrigger }) => {
  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Load organizations data
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const orgData = await getUserOrganizations();
        setOrganizations(orgData);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [refreshTrigger]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = organizations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  
  // Handle pagination click
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render pagination controls
  const renderPagination = () => {
    const pageItems = [];
    
    for (let number = 1; number <= totalPages; number++) {
      pageItems.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev 
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />
        {pageItems}
        <Pagination.Next 
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        />
      </Pagination>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>My Organizations</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : organizations.length === 0 ? (
          <Alert variant="info">
            You haven't created or joined any organizations yet.
          </Alert>
        ) : (
          <>
            <Table responsive>
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((org, index) => (
                  <tr key={index}>
                    <td>{org.organizationName}</td>
                    <td>
                      <Badge bg={org.role === 'ADMIN' ? 'primary' : 'secondary'}>
                        {org.role}
                      </Badge>
                    </td>
                    <td>{formatDate(org.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {renderPagination()}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrganizationsListCard;