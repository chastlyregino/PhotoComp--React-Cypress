import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { Search, Download, Heart, PersonCircle, Grid3x3Gap } from 'react-bootstrap-icons';
import PhotoCarousel from '../../components/PhotoCarousel/PhotoCarousel';
import axios from 'axios';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import * as icon from 'react-bootstrap-icons';
import { getAllPhotos, Photo } from '../../context/PhotoService';

// Import navigation components
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import AuthContext from '../../context/AuthContext';

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
  const { user, token } = useContext(AuthContext);
  
  // State for selected organization and event
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>(orgId || "GalleryTestOrg");
  const [selectedEvent, setSelectedEvent] = useState<string>(eventId || "3dcf897f-7bcf-4ac7-b38f-860a41615223");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  
  // Fetch photos for the current organization and event
  useEffect(() => {
    if (selectedOrg && selectedEvent) {
      const fetchPhotos = async () => {
        try {
          const response = await getAllPhotos(selectedOrg, selectedEvent);
          if (response.data.photos) {
            setPhotos(response.data.photos);
          }
        } catch (error) {
          console.error('Error fetching photos:', error);
        }
      };
      
      fetchPhotos();
    }
  }, [selectedOrg, selectedEvent]);
  
  // Find the index of the selected photo in the photo list when photos are loaded
  useEffect(() => {
    if (photos.length > 0 && photoId) {
      const index = photos.findIndex(photo => photo.id === photoId);
      if (index !== -1) {
        setCurrentPhotoIndex(index);
      }
    }
  }, [photos, photoId]);
  
  // Update the current photo index when the carousel changes
  const handleCarouselChange = (index: number) => {
    setCurrentPhotoIndex(index);
    
    // Optionally update URL to reflect the current photo
    // This would make bookmarking and sharing specific photos work better
    if (photos.length > index) {
      const currentPhotoId = photos[index].id;
      // Update URL without reload
      window.history.replaceState(
        null, 
        '', 
        `/organizations/${selectedOrg}/events/${selectedEvent}/photos/${currentPhotoId}`
      );
    }
  };

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

  // Handle download of the current image
  const handleDownload = async () => {
    if (photos.length === 0 || currentPhotoIndex >= photos.length) {
      console.error('No photo available for download');
      return;
    }

    const currentPhoto = photos[currentPhotoIndex];
    if (!currentPhoto.id) {
      console.error('Photo ID is missing');
      return;
    }
    
    try {
      // Use the correct download endpoint to get a pre-signed download URL
      const token = localStorage.getItem('token');
      const axiosInstance = axios.create({
        baseURL: 'http://localhost:3000',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Call the specific download endpoint
      const response = await axiosInstance.get(
        `/organizations/${selectedOrg}/events/${selectedEvent}/photos/${currentPhoto.id}/download`
      );
      
      if (response.data?.data?.downloadUrl) {
        // Create a temporary anchor element to trigger the download
        const link = document.createElement('a');
        link.href = response.data.data.downloadUrl;
        
        // The downloadUrl already has proper Content-Disposition headers
        // so we don't need to set the download attribute
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Download URL not found in response');
      }
    } catch (error) {
      console.error('Error downloading photo:', error);
      alert('Failed to download photo. Please try again.');
    }
  };
  
  // Search functionality
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search logic if needed
  };

  // TopBar components
  const searchComponent = (
    <SearchBar
      value={searchTerm}
      onChange={handleSearchChange}
      onSubmit={handleSearchSubmit}
      placeholder="Search photos..."
      className="ms-3"
    />
  );

  const rightComponents = (
    <>
      <div className="d-flex align-items-center gap-3">
        {user && token ? (
          <>
            {/* Download button */}
            <Button 
              variant="secondary"
              className="top-bar-element d-flex align-items-center gap-1"
              onClick={handleDownload}
            >
              <icon.Download size={20} />
              <span className="d-none d-md-inline">Download</span>
            </Button>
            
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
          
          <div className="photo-gallery-page bg-dark min-vh-100">
            {/* Gallery action button */}
            <Container fluid className="pt-3 pb-1">
              <Row>
                <Col className="d-flex justify-content-end">
                  <Button variant="outline-light" onClick={handleBackToGallery} className="me-3">
                    Back to Gallery
                  </Button>
                </Col>
              </Row>
            </Container>

            {/* Main carousel section */}
            {selectedOrg && selectedEvent ? (
              <PhotoCarousel 
                orgName={selectedOrg} 
                eventId={selectedEvent} 
                activeIndex={currentPhotoIndex}
                preferredSize="large"
                onIndexChange={handleCarouselChange}
              />
            ) : (
              <Container className="text-center text-white my-5">
                <p>Please select an organization and event to view photos</p>
              </Container>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default PhotoGalleryPage;