import React, { useState, useEffect } from 'react';
import { Carousel, Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, ArrowsFullscreen } from 'react-bootstrap-icons';
import axios from 'axios';
import './PhotoCarousel.css';

// Interface for the API photo data with multiple sizes
interface ApiPhoto {
  id: string;
  eventId: string;
  url: string; // Original URL (kept for backward compatibility)
  urls?: {
    original: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  metadata?: {
    title?: string;
    description?: string;
    width?: number;
    height?: number;
  };
}

// Interface for our transformed photo data
interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  originalUrl: string;
  availableSizes: string[];
  event: string;
  description: string;
  time: string;
  tagged: boolean;
  width?: number;
  height?: number;
}

interface PhotoCarouselProps {
  orgName?: string;
  eventId?: string;
  initialIndex?: number;
  preferredSize?: 'thumbnail' | 'medium' | 'large' | 'original';
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ 
  orgName = "GalleryTestOrg", // exact organization name
  eventId = "3dcf897f-7bcf-4ac7-b38f-860a41615223", //  exact event ID
  initialIndex = 0,
  preferredSize = 'large' // Default to large for carousel view
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("Gallery Test Event");
  const [viewSize, setViewSize] = useState<'thumbnail' | 'medium' | 'large' | 'original'>(preferredSize);
  const [fullScreen, setFullScreen] = useState(false);
  
  // Helper function to select the best URL for the current view size
  const getBestUrlForSize = (photo: ApiPhoto, size: string): string => {
    if (!photo.urls) {
      return photo.url; // Default to original URL if no sizes available
    }

    // Check if the requested size exists
    if (photo.urls[size as keyof typeof photo.urls]) {
      return photo.urls[size as keyof typeof photo.urls] as string;
    }

    // Fallback logic based on requested size
    switch (size) {
      case 'thumbnail':
        return photo.urls.thumbnail || photo.urls.medium || photo.urls.large || photo.urls.original;
      case 'medium':
        return photo.urls.medium || photo.urls.large || photo.urls.original || photo.urls.thumbnail;
      case 'large':
        return photo.urls.large || photo.urls.original || photo.urls.medium || photo.urls.thumbnail;
      case 'original':
      default:
        return photo.urls.original || photo.urls.large || photo.urls.medium || photo.urls.thumbnail;
    }
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      console.log(`Fetching photos for org: ${orgName}, event: ${eventId}`);
      
      try {
        // Create axios instance with proper base URL
        const token = localStorage.getItem('token');
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:3000', // Adjust this to match your API's base URL
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // First fetch the event to get details
        try {
          const eventResponse = await axiosInstance.get(`/organizations/${orgName}/events/${eventId}`);
          if (eventResponse.data?.data?.event) {
            setEventTitle(eventResponse.data.data.event.title || "Gallery Event");
          }
        } catch (eventError) {
          console.warn("Could not fetch event details:", eventError);
        }
        
        // Now fetch all photos for the event
        console.log(`Making request to: /organizations/${orgName}/events/${eventId}/photos`);
        const photosResponse = await axiosInstance.get(`/organizations/${orgName}/events/${eventId}/photos`);
        
        console.log("Photos API response:", photosResponse);

        if (photosResponse.data?.data?.photos) {
          const apiPhotos: ApiPhoto[] = photosResponse.data.data.photos;
          console.log(`Found ${apiPhotos.length} photos:`, apiPhotos);
          
          // Transform API photos to our Photo interface
          const transformedPhotos: Photo[] = apiPhotos.map((apiPhoto: ApiPhoto) => {
            // Get URLs for different sizes
            const originalUrl = apiPhoto.urls?.original || apiPhoto.url;
            const thumbnailUrl = apiPhoto.urls?.thumbnail || apiPhoto.url;
            const mediumUrl = apiPhoto.urls?.medium || apiPhoto.url;
            const largeUrl = apiPhoto.urls?.large || apiPhoto.url;
            
            // Determine best URL based on current view size
            const imageUrl = getBestUrlForSize(apiPhoto, viewSize);
            
            // Determine available sizes
            const availableSizes = apiPhoto.urls 
              ? Object.keys(apiPhoto.urls) 
              : ['original'];
            
            return {
              id: apiPhoto.id,
              imageUrl,
              thumbnailUrl,
              mediumUrl,
              largeUrl,
              originalUrl,
              availableSizes,
              event: eventTitle,
              description: apiPhoto.metadata?.description || "No description",
              time: new Date(apiPhoto.createdAt).toLocaleDateString(),
              tagged: false, // We'll assume no tags by default
              width: apiPhoto.metadata?.width,
              height: apiPhoto.metadata?.height
            };
          });
          
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
            originalUrl: 'https://placehold.co/958x680',
            thumbnailUrl: 'https://placehold.co/200x150',
            mediumUrl: 'https://placehold.co/800x600',
            largeUrl: 'https://placehold.co/1600x1200',
            availableSizes: ['thumbnail', 'medium', 'large', 'original'],
            event: 'Fallback Event',
            description: 'API Error - Using Sample Data',
            time: new Date().toLocaleDateString(),
            tagged: false,
            width: 958,
            height: 680
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [orgName, eventId, eventTitle]);

  // Only update image URLs when view size changes
  useEffect(() => {
    if (photos.length > 0) {
      // Update image URLs based on new view size
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => ({
          ...photo,
          imageUrl: viewSize === 'thumbnail' ? photo.thumbnailUrl || photo.imageUrl :
                    viewSize === 'medium' ? photo.mediumUrl || photo.imageUrl :
                    viewSize === 'large' ? photo.largeUrl || photo.imageUrl :
                    photo.originalUrl
        }))
      );
    }
  }, [viewSize]);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };
  
  const toggleViewSize = () => {
    // Cycle through sizes: large -> original -> medium -> large
    if (viewSize === 'large') setViewSize('original');
    else if (viewSize === 'original') setViewSize('medium');
    else setViewSize('large');
  };
  
  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  const handleDownload = async (photo: Photo) => {
    try {
      // Create a downloadable link for the current photo
      if (photo.originalUrl) {
        const token = localStorage.getItem('token');
        // Make a request to the download endpoint
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:3000',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const downloadResponse = await axiosInstance.get(
          `/organizations/${orgName}/events/${eventId}/photos/${photo.id}/download?size=original`
        );
        
        if (downloadResponse.data?.data?.downloadUrl) {
          // Create a temporary anchor element to trigger the download
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadResponse.data.data.downloadUrl;
          downloadLink.download = `photo-${photo.id}.jpg`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else {
          console.error("No download URL in response:", downloadResponse.data);
          setError("Could not generate download link.");
        }
      }
    } catch (err) {
      console.error('Error downloading photo:', err);
      setError("Failed to download photo. Please try again later.");
    }
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
    <Container className={`photo-carousel-container my-4 ${fullScreen ? 'full-screen' : ''}`}>
      <Row className="justify-content-center">
        <Col xs={12} className="text-start mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-white fw-normal" style={{ fontFamily: 'Michroma' }}>
              Photos: {eventTitle}
            </h2>
            <div>
              <Button 
                variant="outline-light" 
                size="sm" 
                className="me-2"
                onClick={toggleViewSize}
              >
                {`Size: ${viewSize}`}
              </Button>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={toggleFullScreen}
                className="me-2"
              >
                <ArrowsFullscreen />
              </Button>
              {photos.length > 0 && (
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => handleDownload(photos[index])}
                >
                  Download
                </Button>
              )}
            </div>
          </div>
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
                        maxWidth: fullScreen ? '100%' : '958px', 
                        height: fullScreen ? '90vh' : '680px', 
                        objectFit: 'contain',
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
                    {photo.width && photo.height && (
                      <small className="text-muted">
                        Original dimensions: {photo.width}x{photo.height}
                      </small>
                    )}
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