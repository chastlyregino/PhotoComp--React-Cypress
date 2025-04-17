import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import * as icon from 'react-bootstrap-icons';
import AuthContext from '../../context/AuthContext';

// Import components
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import MemberCard from '../../components/cards/memberCard/MemberCard';
import axiosInstance from '../../utils/axios';
import { getEventAttendees } from '../../context/EventService';

// Define types for our data models
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Member {
  PK: string;
  SK: string;
  userId: string;
  role: string;
  joinDate: string;
  organizationName: string;
  userDetails: User;
}

interface EventAttendee extends Member {
  eventId: string;
}

const PhotoTaggingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: orgId, eid: eventId, photoId } = useParams();
  const { user, token } = useContext(AuthContext);
  
  // State for search and members
  const [searchTerm, setSearchTerm] = useState('');
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>('');
  
  // Pagination state - modified for better scrolling experience
  const [initialDisplayCount, setInitialDisplayCount] = useState<number>(12); // Initial number to display
  const [displayCount, setDisplayCount] = useState<number>(12); // Current display count
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);

  // Fetch attendees for the event
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!orgId || !eventId || !photoId) {
        setError('Missing organization, event, or photo ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // First get event details to display the event name
        try {
          const eventResponse = await axiosInstance.get(`/organizations/${orgId}/events/${eventId}`);
          if (eventResponse.data && eventResponse.data.data && eventResponse.data.data.event) {
            setEventName(eventResponse.data.data.event.title);
          }
        } catch (eventError) {
          console.error('Error fetching event details:', eventError);
          // Continue with attendee fetching even if event details fail
        }
        
        // Fetch event attendees using the correct endpoint and handling
        try {
          // Using the getEventAttendees helper from EventService for consistency
          const attendees = await getEventAttendees(orgId, eventId);
          
          console.log('Raw attendees response:', attendees); // Debug log
          
          if (attendees && attendees.length > 0) {
            // Transform attendees to expected format if needed
            const formattedAttendees = await Promise.all(
              attendees.map(async (attendee) => {
                // Extract userId from format like USER#userId
                const userId = attendee.includes('#') ? 
                  attendee.split('#')[1] : 
                  attendee;
                
                // Fetch user details for this attendee
                try {
                  const userResponse = await axiosInstance.get(`/users/${userId}`);
                  const userData = userResponse.data.data?.user || {};
                  
                  // Create a properly formatted attendee object
                  return {
                    PK: `USER#${userId}`,
                    SK: `EVENT#${eventId}`,
                    userId: userId,
                    role: 'MEMBER', // Default role
                    joinDate: new Date().toISOString(),
                    organizationName: orgId,
                    eventId: eventId,
                    userDetails: {
                      id: userId,
                      email: userData.email || 'email@example.com',
                      firstName: userData.firstName || 'User',
                      lastName: userData.lastName || userId,
                    }
                  };
                } catch (userError) {
                  console.error(`Error fetching details for user ${userId}:`, userError);
                  // Return a placeholder object with available info
                  return {
                    PK: `USER#${userId}`,
                    SK: `EVENT#${eventId}`,
                    userId: userId,
                    role: 'MEMBER',
                    joinDate: new Date().toISOString(),
                    organizationName: orgId,
                    eventId: eventId,
                    userDetails: {
                      id: userId,
                      email: 'email@example.com',
                      firstName: 'User',
                      lastName: userId,
                    }
                  };
                }
              })
            );
            
            console.log('Formatted attendees:', formattedAttendees); // Debug log
            setAttendees(formattedAttendees);
            setFilteredAttendees(formattedAttendees);
            
            // Update hasMore based on number of attendees vs. initial display count
            setHasMore(formattedAttendees.length > initialDisplayCount);
          } else {
            console.log('No attendees found or invalid response format');
            setAttendees([]);
            setFilteredAttendees([]);
            setHasMore(false);
          }
        } catch (attendeesError) {
          console.error('Error fetching attendees:', attendeesError);
          throw attendeesError;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in main fetchAttendees function:', err);
        setError('Failed to load event attendees. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAttendees();
  }, [orgId, eventId, photoId, initialDisplayCount]);
  
  // Handle load more function
  const handleLoadMore = () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX (remove in production)
    setTimeout(() => {
      // Increase display count by the initial batch size
      const newDisplayCount = displayCount + initialDisplayCount;
      setDisplayCount(newDisplayCount);
      
      // Check if we've reached the end of our data
      setHasMore(newDisplayCount < filteredAttendees.length);
      setLoadingMore(false);
    }, 500);
  };
  
  // Filter attendees based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAttendees(attendees);
      // Reset display count when clearing search
      setDisplayCount(initialDisplayCount);
      setHasMore(attendees.length > initialDisplayCount);
    } else {
      const filtered = attendees.filter((attendee: EventAttendee) => {
        const { firstName, lastName, email } = attendee.userDetails;
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || email.toLowerCase().includes(searchLower);
      });
      
      setFilteredAttendees(filtered);
      // Show all search results immediately
      setDisplayCount(filtered.length);
      setHasMore(false);
    }
  }, [attendees, searchTerm, initialDisplayCount]);
  
  // Get the currently visible members based on display count
  const visibleAttendees = filteredAttendees.slice(0, displayCount);
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  // Toggle member selection
  const handleMemberSelect = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };
  
  // Submit tags
  const handleSubmitTags = async () => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one member to tag');
      return;
    }
    
    if (!orgId || !eventId || !photoId) {
      setError('Missing organization, event, or photo ID');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axiosInstance.post(
        `/organizations/${orgId}/events/${eventId}/photos/${photoId}/tags`,
        { userIds: selectedMembers }
      );
      
      console.log('Tag response:', response.data);
      setSuccess('Members tagged successfully!');
      setSubmitting(false);
      
      // Redirect back to photo page after a short delay
      setTimeout(() => {
        navigate(`/organizations/${orgId}/events/${eventId}/photos/${photoId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error tagging members:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to tag members. Please try again.');
      }
      
      setSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate(`/organizations/${orgId}/events/${eventId}/photos/${photoId}`);
  };
  
  // TopBar components
  const searchComponent = (
    <SearchBar
      value={searchTerm}
      onChange={handleSearchChange}
      onSubmit={handleSearchSubmit}
      placeholder="Search members..."
      className="ms-3"
    />
  );
  
  const rightComponents = (
    <>
      <div className="d-flex align-items-center gap-3">
        {user && token ? (
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
            <NavButton
              to="/register"
              variant="outline-light"
              className="mx-1 top-bar-element"
            >
              Register
            </NavButton>
            <NavButton to="/login" variant="outline-light" className="top-bar-element">
              Login
            </NavButton>
          </>
        )}
      </div>
    </>
  );
  
  return (
    <>
      <Row className="g-0">
        <Col md="auto" className="sidebar-container">
          <Sidebar />
        </Col>
        <Col className="main-content p-0">
          <div className="sticky-top bg-dark z-3">
            <Row>
              <TopBar
                searchComponent={searchComponent}
                rightComponents={rightComponents}
              />
            </Row>
          </div>
          
          <div className="photo-tagging-page bg-dark text-light min-vh-100">
            <Container fluid className="px-4 pt-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Photos: {eventName}</h1>
                <NavButton
                  to={`/organizations/${orgId}/events/${eventId}/photos/${photoId}`}
                  variant="outline-light"
                >
                  <icon.X size={24} className="me-2" />
                  Close
                </NavButton>
              </div>
              
              <h2 className="fs-3 mb-4 text-center">Select the members that you want to tag</h2>
              
              {/* Error and Success Alerts */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}
              
              <h3 className="mb-3">Members who attended:</h3>
              
              {loading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="light" />
                  <p className="mt-3">Loading event attendees...</p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="text-center p-5">
                  {searchTerm ? 'No matching members found.' : 'No members attended this event.'}
                </div>
              ) : (
                <>
                  {/* Display members in a card grid layout */}
                  <Row className="g-4 member-cards-container mb-4">
                    {visibleAttendees.map((attendee: EventAttendee) => (
                      <Col xs={12} sm={6} md={4} lg={3} key={attendee.userId} className="d-flex justify-content-center">
                        <MemberCard
                          member={attendee}
                          isSelected={selectedMembers.includes(attendee.userId)}
                          onSelect={handleMemberSelect}
                        />
                      </Col>
                    ))}
                  </Row>
                  
                  {/* Load More Button */}
                  {!searchTerm && hasMore && (
                    <div className="text-center mt-4 mb-5">
                      <Button
                        variant="primary"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="load-more-button"
                      >
                        {loadingMore ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {/* Action Buttons */}
              <div className="action-buttons-container d-flex justify-content-between my-4">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleSubmitTags}
                  disabled={selectedMembers.length === 0 || submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Tagging...
                    </>
                  ) : (
                    `Tag selected members (${selectedMembers.length})`
                  )}
                </Button>
              </div>
            </Container>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default PhotoTaggingPage;