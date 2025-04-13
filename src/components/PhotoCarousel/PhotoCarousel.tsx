import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import axios from 'axios';
import './PhotoCarousel.css';

// Interface for the API photo data
interface ApiPhoto {
  id: string;
  eventId: string;
  url: string;
  createdAt: string;
  uploadedBy: string;
  metadata?: {
    title?: string;
    description?: string;
  };
}

// Interface for our transformed photo data
interface Photo {
  id: string;
  imageUrl: string;
  event: string;
  description: string;
  time: string;
  tagged: boolean;
}

interface PhotoCarouselProps {
  orgName?: string;
  eventId?: string;
  initialIndex?: number;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ 
  orgName = "TestOrg", // Default org name
  eventId, // If not provided, will be fetched from first event
  initialIndex = 0 
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("Loading...");

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        // First, if we don't have an eventId, get the first event for this org
        let targetEventId = eventId;
        if (!targetEventId) {
          const eventsResponse = await axios.get(`/organizations/${orgName}/events`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (eventsResponse.data.data.events && eventsResponse.data.data.events.length > 0) {
            const firstEvent = eventsResponse.data.data.events[0];
            targetEventId = firstEvent.PK.replace('EVENT#', '');
            setEventTitle(firstEvent.title);
          } else {
            throw new Error("No events found for this organization");
          }
        }

        // Now fetch photos for this event
        const photosResponse = await axios.get(`/organizations/${orgName}/events/${targetEventId}/photos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (photosResponse.data.data.photos) {
          // Transform API photos to our Photo interface
          const transformedPhotos: Photo[] = photosResponse.data.data.photos.map((apiPhoto: ApiPhoto) => ({
            id: apiPhoto.id,
            imageUrl: apiPhoto.url,
            event: eventTitle,
            description: apiPhoto.metadata?.description || "No description",
            time: new Date(apiPhoto.createdAt).toLocaleDateString(),
            tagged: false // We'll assume no tags by default
          }));
          
          setPhotos(transformedPhotos);
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError("Failed to load photos. Please try again later.");
        
        // If API fails, use sample data for testing
        setPhotos([
          {
            id: '1',
            imageUrl: 'https://placehold.co/958x680',
            event: 'Fallback Event',
            description: 'API Error - Using Sample Data',
            time: new Date().toLocaleDateString(),
            tagged: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [orgName, eventId]);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="text-center text-white my-5">
        <p>Loading photos...</p>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="text-center text-white my-5">
        <p>{error}</p>
      </Container>
    );
  }

  // Ensure we have photos to display
  if (!photos || photos.length === 0) {
    return (
      <Container className="text-center text-white my-5">
        <p>No photos available to display</p>
      </Container>
    );
  }

  return (
    <Container className="photo-carousel-container my-4">
      <Row className="justify-content-center">
        <Col xs={12} className="text-start mb-3">
          <h2 className="text-white fw-normal" style={{ fontFamily: 'Michroma' }}>
            Photos : {eventTitle}
          </h2>
        </Col>
        
        <Col xs={12} className="position-relative">
          {/* Custom Carousel with custom controls */}
          <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            indicators={false}
            interval={null}
            className="photo-carousel"
            prevIcon={
              <div className="carousel-control-icon">
                <ChevronLeft size={36} />
              </div>
            }
            nextIcon={
              <div className="carousel-control-icon">
                <ChevronRight size={36} />
              </div>
            }
          >
            {photos.map((photo) => (
              <Carousel.Item key={photo.id}>
                <div className="carousel-image-container">
                  <img
                    className="d-block w-100 rounded carousel-image"
                    src={photo.imageUrl}
                    alt={photo.description}
                    style={{ 
                      maxWidth: '958px', 
                      height: '680px', 
                      objectFit: 'cover',
                      boxShadow: '0px 8px 35px rgba(0, 0, 0, 0.16)'
                    }}
                  />
                </div>
                <div 
                  className="text-center text-white mt-3"
                  style={{ 
                    fontFamily: 'Michroma', 
                    fontSize: '24px',
                    maxWidth: '953px',
                    margin: '0 auto'
                  }}
                >
                  <p className="mb-0">
                    Photo Description: {photo.event}; {photo.description}; {photo.time}; 
                    {photo.tagged ? ' Tagged' : ' Not Tagged'}
                  </p>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </Container>
  );
};

export default PhotoCarousel;