import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Alert } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import axios from 'axios';
import './PhotoCarousel.css';

// Interface for the API photo data
interface ApiPhoto {
  id: string;
  eventId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
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
  orgName = "GalleryTestOrg", // exact organization name
  eventId = "3dcf897f-7bcf-4ac7-b38f-860a41615223", //  exact event ID
  initialIndex = 0 
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("Gallery Test Event");

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      console.log(`Fetching photos for org: ${orgName}, event: ${eventId}`);
      
      try {
        // Create axios instance with proper base URL
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:3000',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Directly fetch photos for the specific event
        console.log(`Making request to: /organizations/${orgName}/events/${eventId}/photos`);
        const photosResponse = await axiosInstance.get(`/organizations/${orgName}/events/${eventId}/photos`);
        
        console.log("Photos API response:", photosResponse);

        if (photosResponse.data?.data?.photos) {
          const apiPhotos: ApiPhoto[] = photosResponse.data.data.photos;
          console.log(`Found ${apiPhotos.length} photos:`, apiPhotos);
          
          // Transform API photos to our Photo interface
          const transformedPhotos: Photo[] = apiPhotos.map((apiPhoto: ApiPhoto) => ({
            id: apiPhoto.id,
            imageUrl: apiPhoto.url,
            event: eventTitle,
            description: apiPhoto.metadata?.description || "No description",
            time: new Date(apiPhoto.createdAt).toLocaleDateString(),
            tagged: false // We'll assume no tags by default
          }));
          
          setPhotos(transformedPhotos);
        } else {
          console.error("No photos data in response:", photosResponse.data);
          setError("Could not retrieve photos from the server.");
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
  }, [orgName, eventId, eventTitle]);

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

  return (
    <Container className="photo-carousel-container my-4">
      <Row className="justify-content-center">
        <Col xs={12} className="text-start mb-3">
          <h2 className="text-white fw-normal" style={{ fontFamily: 'Michroma' }}>
            Photos: {eventTitle}
          </h2>
          {error && (
            <Alert variant="warning">
              {error}
            </Alert>
          )}
        </Col>
        
        {photos.length > 0 ? (
          <Col xs={12} className="position-relative">
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
                      {photo.description} | {photo.time}
                    </p>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
        ) : (
          <Col xs={12} className="text-center">
            <p className="text-white">No photos available to display</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default PhotoCarousel;