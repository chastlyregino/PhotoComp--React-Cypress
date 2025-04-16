import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { Search, Download, Heart, PersonCircle, Grid3x3Gap } from 'react-bootstrap-icons';
import PhotoCarousel from '../../components/PhotoCarousel/PhotoCarousel';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

interface Organization {
  name: string;
  id: string;
  description?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
}

const PhotoGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: orgId, eid: eventId, photoId } = useParams();
  
  // State for selected organization and event
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>(orgId || "GalleryTestOrg");
  const [selectedEvent, setSelectedEvent] = useState<string>(eventId || "3dcf897f-7bcf-4ac7-b38f-860a41615223");
  const [initialPhotoIndex, setInitialPhotoIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Find the index of the selected photo in the photo list
  useEffect(() => {
    if (photoId && selectedEvent) {
      const fetchPhotoIndex = async () => {
        try {
          const token = localStorage.getItem('token');
          const axiosInstance = axios.create({
            baseURL: 'http://localhost:3000',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const response = await axiosInstance.get(`/organizations/${selectedOrg}/events/${selectedEvent}/photos`);
          
          if (response.data?.data?.photos) {
            const photos = response.data.data.photos;
            const photoIndex = photos.findIndex((photo: any) => photo.id === photoId);
            
            if (photoIndex !== -1) {
              setInitialPhotoIndex(photoIndex);
            }
          }
        } catch (error) {
          console.error('Error finding photo index:', error);
        }
      };
      
      fetchPhotoIndex();
    }
  }, [photoId, selectedEvent, selectedOrg]);

  // Fetch organizations when component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:3000',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Only fetch organizations if we don't have the orgId from URL params
        if (!orgId) {
          const response = await axiosInstance.get('/organizations');
          
          if (response.data?.org) {
            setOrganizations(response.data.org.map((org: any) => ({
              name: org.organizationName,
              id: org.organizationName,
              description: `Organization: ${org.organizationName}`
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError("Could not fetch organizations");
        
        // For testing - provide fallback data if API fails
        setOrganizations([{
          name: selectedOrg,
          id: selectedOrg,
          description: "Organization"
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [orgId, selectedOrg]);
  
  // Fetch events when selected organization changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedOrg) return;
      
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:3000',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Only fetch events if we don't have the eventId from URL params
        if (!eventId) {
          const response = await axiosInstance.get(`/organizations/${selectedOrg}/events`);
          
          if (response.data?.data?.events) {
            setEvents(response.data.data.events.map((event: any) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              date: event.date
            })));
            
            // If we have events, select the first one by default
            if (response.data.data.events.length > 0 && !selectedEvent) {
              setSelectedEvent(response.data.data.events[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError("Could not fetch events");
        
        // For testing - provide fallback data if API fails
        setEvents([{
          id: selectedEvent,
          title: "Event",
          description: "Event for Gallery",
          date: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [selectedOrg, eventId, selectedEvent]);
  
  const handleOrgChange = (orgName: string) => {
    setSelectedOrg(orgName);
    navigate(`/organizations/${orgName}/events`);
  };
  
  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    navigate(`/organizations/${selectedOrg}/events/${eventId}/photos`);
  };

  const handleBackToGallery = () => {
    navigate(`/organizations/${selectedOrg}/events/${selectedEvent}/photos`);
  };
  
  return (
    <div className="photo-gallery-page bg-dark min-vh-100">
      {/* Header/Nav area */}
      <Container fluid className="py-3">
        <Row className="align-items-center">
          <Col xs={12} md={4}>
            {/* Organization Selector */}
            <Dropdown className="mb-2">
              <Dropdown.Toggle variant="light" id="dropdown-org">
                <Grid3x3Gap className="me-2" />
                {selectedOrg || "Select Organization"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {organizations.map(org => (
                  <Dropdown.Item 
                    key={org.id} 
                    onClick={() => handleOrgChange(org.name)}
                    active={selectedOrg === org.name}
                  >
                    {org.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          
          <Col xs={12} md={4}>
            {/* Event Selector */}
            <Dropdown className="mb-2">
              <Dropdown.Toggle variant="light" id="dropdown-event">
                {events.find(e => e.id === selectedEvent)?.title || "Select Event"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {events.map(event => (
                  <Dropdown.Item 
                    key={event.id} 
                    onClick={() => handleEventChange(event.id)}
                    active={selectedEvent === event.id}
                  >
                    {event.title} ({new Date(event.date).toLocaleDateString()})
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          
          <Col xs={12} md={4} className="d-flex justify-content-end gap-2 mt-3 mt-md-0">
            {/* Back to gallery button */}
            <Button variant="outline-light" onClick={handleBackToGallery}>
              Back to Gallery
            </Button>
            
            {/* User actions */}
            <Button variant="link" className="text-white">
              <Heart size={24} />
            </Button>
            <Button variant="link" className="text-white">
              <PersonCircle size={24} />
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Main carousel section */}
      {selectedOrg && selectedEvent ? (
        <PhotoCarousel 
          orgName={selectedOrg} 
          eventId={selectedEvent} 
          initialIndex={initialPhotoIndex}
          preferredSize="large"
        />
      ) : (
        <Container className="text-center text-white my-5">
          <p>Please select an organization and event to view photos</p>
        </Container>
      )}
    </div>
  );
};

export default PhotoGalleryPage;