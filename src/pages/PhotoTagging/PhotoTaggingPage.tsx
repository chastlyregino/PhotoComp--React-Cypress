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
import axiosInstance from '../../utils/axios';

// Define types for our data models
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Member {
  userId: string;
  role: string;
  joinDate: string;
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
        const eventResponse = await axiosInstance.get(`/organizations/${orgId}/events/${eventId}`);
        if (eventResponse.data && eventResponse.data.data && eventResponse.data.data.event) {
          setEventName(eventResponse.data.data.event.title);
        }
        
        // Then get event attendees
        const response = await axiosInstance.get(`/organizations/${orgId}/events/${eventId}/attendants`);
        
        if (response.data && response.data.data && response.data.data.attendants) {
          setAttendees(response.data.data.attendants);
          setFilteredAttendees(response.data.data.attendants);
        } else {
          setAttendees([]);
          setFilteredAttendees([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event attendees:', err);
        setError('Failed to load event attendees. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAttendees();
  }, [orgId, eventId, photoId]);
  
  // Filter attendees based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAttendees(attendees);
    } else {
      const filtered = attendees.filter(attendee => {
        const { firstName, lastName, email } = attendee.userDetails;
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || email.toLowerCase().includes(searchLower);
      });
      setFilteredAttendees(filtered);
    }
  }, [attendees, searchTerm]);
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
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
                <div className="member-grid mb-4">
                  <Row className="g-4">
                    {filteredAttendees.map(attendee => (
                      <Col xs={12} sm={6} md={4} key={attendee.userId}>
                        <div 
                          className={`member-card h-100 p-0 position-relative ${selectedMembers.includes(attendee.userId) ? 'selected' : ''}`}
                          onClick={() => toggleMemberSelection(attendee.userId)}
                        >
                          <div 
                            className="card-content text-white p-4 d-flex flex-column justify-content-between h-100"
                            style={{ 
                              width: '100%', 
                              height: '200px',
                              position: 'relative',
                              cursor: 'pointer',
                              backgroundColor: selectedMembers.includes(attendee.userId) ? '#4d5154' : '#343a40',
                              borderColor: selectedMembers.includes(attendee.userId) ? '#fff' : 'transparent',
                              borderWidth: selectedMembers.includes(attendee.userId) ? '2px' : '1px',
                              borderStyle: 'solid',
                              borderRadius: '12px',
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <div>
                              <h5 className="card-title">
                                {attendee.userDetails.firstName} {attendee.userDetails.lastName}
                              </h5>
                              <p className="card-text text-white-50 small">
                                {attendee.userDetails.email}
                              </p>
                            </div>
                            
                            {selectedMembers.includes(attendee.userId) && (
                              <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                                <icon.CheckCircleFill size={24} className="text-success" />
                              </div>
                            )}
                            
                            <div className="card-footer bg-transparent border-0 text-white-50">
                              <small>Role: {attendee.role}</small>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              
              {/* Action Buttons - Fixed at bottom */}
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
                  {submitting ? 'Tagging...' : 'Tag selected members'}
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