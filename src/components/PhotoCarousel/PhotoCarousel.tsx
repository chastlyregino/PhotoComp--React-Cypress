import React, { useState, useEffect } from 'react';
import { Carousel, Button, Spinner } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import { Photo, getAllPhotos } from '../../context/PhotoService';

interface CustomPhotoCarouselProps {
  orgName: string;
  eventId: string;
  activeIndex: number;
  preferredSize?: 'small' | 'medium' | 'large';
  onIndexChange: (index: number) => void;
}

const CustomPhotoCarousel: React.FC<CustomPhotoCarouselProps> = ({ 
  orgName, 
  eventId, 
  activeIndex, 
  preferredSize = 'medium',
  onIndexChange
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await getAllPhotos(orgName, eventId);
        
        if (response.data.photos && response.data.photos.length > 0) {
          setPhotos(response.data.photos);
        } else {
          setError("No photos found for this event");
        }
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError("Failed to load photos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, [orgName, eventId]);
  
  const handleSelect = (selectedIndex: number) => {
    onIndexChange(selectedIndex);
  };
  
  // Calculate size based on preference
  const getCarouselSize = () => {
    switch (preferredSize) {
      case 'small':
        return { width: '100%', maxHeight: '400px', height: 'auto' };
      case 'large':
        return { width: '100%', maxHeight: '80vh', height: 'auto' };
      case 'medium':
      default:
        return { width: '100%', maxHeight: '600px', height: 'auto' };
    }
  };

  // Get the appropriate image URL based on available sizes
  const getImageUrl = (photo: Photo) => {
    // Check if photo has urls object with different sizes
    if (photo.urls) {
      // First try to use the medium size if available
      if (photo.urls.medium) {
        return photo.urls.medium;
      }
      
      // If no medium, fall back to other sizes in order of preference
      if (photo.urls.large) {
        return photo.urls.large;
      }
      
      if (photo.urls.original) {
        return photo.urls.original;
      }
      
      if (photo.urls.thumbnail) {
        return photo.urls.thumbnail;
      }
    }
    
    // If no urls object or no sizes in it, use the main url
    return photo.url;
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-white p-5">
        <p>{error}</p>
      </div>
    );
  }
  
  if (photos.length === 0) {
    return (
      <div className="text-center text-white p-5">
        <p>No photos available for this event</p>
      </div>
    );
  }
  
  return (
    <div className="photo-carousel-container">
      <Carousel
        activeIndex={activeIndex}
        onSelect={handleSelect}
        interval={null}
        indicators={photos.length > 1}
        prevIcon={<ChevronLeft color="white" size={40} />}
        nextIcon={<ChevronRight color="white" size={40} />}
        className="bg-dark"
      >
        {photos.map((photo, index) => (
          <Carousel.Item key={photo.id}>
            <div className="d-flex justify-content-center align-items-center" style={getCarouselSize()}>
              <img
                src={getImageUrl(photo)}
                alt={photo.metadata?.title || `Photo ${index + 1}`}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <Carousel.Caption className="d-flex justify-content-between align-items-center">
              <div className="text-start">
                <h3>{photo.metadata?.title || `Photo ${index + 1}`}</h3>
                {photo.metadata?.description && <p>{photo.metadata.description}</p>}
              </div>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
      
      <div className="carousel-counter text-white text-center mt-2">
        Photo {activeIndex + 1} of {photos.length}
      </div>
    </div>
  );
};

export default CustomPhotoCarousel;