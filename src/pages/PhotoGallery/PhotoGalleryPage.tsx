import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { Search, Download, Heart, PersonCircle, Grid3x3Gap } from 'react-bootstrap-icons';
import PhotoCarousel from '../../components/PhotoCarousel/PhotoCarousel';
import axios from 'axios';

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
  // State for selected organization and event
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("GalleryTestOrg");
  const [selectedEvent, setSelectedEvent] = useState<string>("3dcf897f-7bcf-4ac7-b38f-860a41615223");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        const response = await axiosInstance.get('/organizations');
        
        if (response.data?.org) {
          setOrganizations(response.data.org.map((org: any) => ({
            name: org.organizationName,
            id: org.organizationName,
            description: `Organization: ${org.organizationName}`
          })));
          
          // If we have organizations, select the first one by default
          if (response.data.org.length > 0 && !selectedOrg) {
            setSelectedOrg(response.data.org[0].organizationName);
          }
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError("Could not fetch organizations");
        
        // For testing - provide fallback data if API fails
        setOrganizations([{
          name: "GalleryTestOrg",
          id: "GalleryTestOrg",
          description: "Test Organization"
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();
  }, []);
  
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
      } catch (err) {
        console.error('Error fetching events:', err);
        setError("Could not fetch events");
        
        // For testing - provide fallback data if API fails
        setEvents([{
          id: "3dcf897f-7bcf-4ac7-b38f-860a41615223",
          title: "Gallery Test Event",
          description: "Test Event for Gallery",
          date: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [selectedOrg]);
  
  const handleOrgChange = (orgName: string) => {
    setSelectedOrg(orgName);
    // Reset selected event when organization changes
    setSelectedEvent("");
  };
  
  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
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