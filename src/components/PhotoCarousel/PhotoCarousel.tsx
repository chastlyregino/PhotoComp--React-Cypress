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
        return { width: '100%', maxHeight: '75vh', height: 'auto' };
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
  
  // Custom carousel controls with white square backgrounds and rounded edges
  const customPrevIcon = (
    <div className="carousel-nav-button carousel-nav-prev">
      <ChevronLeft color="dark" size={36} />
    </div>
  );
  
  const customNextIcon = (
    <div className="carousel-nav-button carousel-nav-next">
      <ChevronRight color="dark" size={36} />
    </div>
  );
  
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
      <style>
        {`
          .carousel-nav-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            opacity: 0.9;
            transition: opacity 0.2s ease;
            z-index: 1000;
          }
          
          .carousel-nav-button:hover {
            opacity: 1;
            cursor: pointer;
          }
          
          .carousel-nav-prev {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
          }
          
          .carousel-nav-next {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
          }
          
          .carousel-control-prev,
          .carousel-control-next {
            opacity: 1;
            width: 10%;
          }
          
          .carousel-control-prev-icon,
          .carousel-control-next-icon {
            display: none;
          }
          
          /* Add some vertical padding to the carousel container */
          .photo-carousel-container {
            padding-top: 20px;
            padding-bottom: 20px;
          }
          
          /* Center the carousel in the available space */
          .carousel {
            margin: 0 auto;
          }
        `}
      </style>
      <Carousel
        activeIndex={activeIndex}
        onSelect={handleSelect}
        interval={null}
        indicators={false}
        prevIcon={customPrevIcon}
        nextIcon={customNextIcon}
        className="bg-dark position-relative"
      >
        {photos.map((photo, index) => (
          <Carousel.Item key={photo.id}>
            {/* Image container */}
            <div className="d-flex justify-content-center align-items-center" style={getCarouselSize()}>
              <img
                src={getImageUrl(photo)}
                alt={photo.metadata?.title || `Photo ${index + 1}`}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            
            {/* Caption container - inline display */}
            <div className="text-center text-white py-3">
              <span className="fw-bold">{photo.metadata?.title || `Photo ${index + 1}`}</span>
              {photo.metadata?.description && (
                <>
                  <span className="mx-2">-</span>
                  <span>{photo.metadata.description}</span>
                </>
              )}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default CustomPhotoCarousel;