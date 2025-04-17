import React, { useState, useEffect, useContext } from 'react';
import { Carousel, Button, Spinner, OverlayTrigger, Tooltip, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, TagFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { Photo, getAllPhotos } from '../../context/PhotoService';
import AuthContext from '../../context/AuthContext';
import { getPhotoTags, TaggedUserWithDetails } from '../../context/PhotoTagService';

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
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [taggedUsers, setTaggedUsers] = useState<Map<string, TaggedUserWithDetails[]>>(new Map());
  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  
  // Debug user role
  useEffect(() => {
    if (user) {
      console.log('Current user role:', user.role);
    }
  }, [user]);
  
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
  
  // Fetch tags for the current photo when activeIndex changes
  useEffect(() => {
    const fetchPhotoTags = async () => {
      if (photos.length > 0 && activeIndex >= 0 && activeIndex < photos.length) {
        const currentPhoto = photos[activeIndex];
        
        // Check if we already fetched tags for this photo
        if (!taggedUsers.has(currentPhoto.id)) {
          try {
            setLoadingTags(true);
            const response = await getPhotoTags(orgName, eventId, currentPhoto.id);
            
            if (response && response.data && response.data.tags) {
              setTaggedUsers(prev => new Map(prev).set(currentPhoto.id, response.data.tags));
            }
          } catch (err) {
            console.error('Error fetching photo tags:', err);
          } finally {
            setLoadingTags(false);
          }
        }
      }
    };
    
    fetchPhotoTags();
  }, [photos, activeIndex, orgName, eventId, taggedUsers]);
  
  const handleSelect = (selectedIndex: number) => {
    onIndexChange(selectedIndex);
  };
  
  // Navigate to the tag people page
  const handleTagPeople = () => {
    if (photos.length > 0 && activeIndex >= 0 && activeIndex < photos.length) {
      const currentPhoto = photos[activeIndex];
      navigate(`/organizations/${orgName}/events/${eventId}/photos/${currentPhoto.id}/tag`);
    }
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
  
  // Get current photo and its tags
  const currentPhoto = photos[activeIndex];
  const currentPhotoTags = taggedUsers.get(currentPhoto.id) || [];
  
  // Only show the tag button to admin users - ROLE CHECK RESTORED
  const showTagButton = user && (user.role === 'ADMIN' || user.role === 'admin');
  
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
            position: relative;
          }
          
          /* Center the carousel in the available space */
          .carousel {
            margin: 0 auto;
          }

          /* Style for the caption container */
          .photo-caption-container {
            margin-top: 20px;
            text-align: center;
            padding: 15px;
          }
          
          /* Style for tagged users */
          .tagged-users-container {
            margin-top: 10px;
            text-align: center;
          }
          
          .tagged-user-pill {
            display: inline-block;
            padding: 4px 10px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 20px;
            margin: 4px;
            font-size: 14px;
          }
          
          /* Super visible tag button */
          .super-visible-tag-button {
            font-size: 1.2rem;
            margin: 20px auto;
            padding: 10px 20px;
            display: block;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
          }
          
          .super-visible-tag-button:hover {
            background-color: #c82333;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
          }
          
          .super-visible-tag-button:focus {
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5);
          }
        `}
      </style>
      
      {/* IMPORTANT: Added a completely separate tag button container before the carousel */}
      {showTagButton && (
        <Container fluid className="mb-3">
          <Row className="justify-content-center">
            <Col xs={12} className="text-center">
              <Button
                variant="danger"
                size="lg"
                className="super-visible-tag-button"
                onClick={handleTagPeople}
              >
                <TagFill className="me-2" /> TAG PEOPLE IN THIS PHOTO
              </Button>
            </Col>
          </Row>
        </Container>
      )}
      
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
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Caption container outside the carousel */}
      {photos.length > 0 && activeIndex < photos.length && (
        <div className="photo-caption-container text-white">
          <span className="fw-bold">
            {currentPhoto.metadata?.title || `Photo ${activeIndex + 1}`}
          </span>
          {currentPhoto.metadata?.description && (
            <>
              <span className="mx-2">-</span>
              <span>{currentPhoto.metadata.description}</span>
            </>
          )}
          
          {/* Show tagged users */}
          {loadingTags ? (
            <div className="d-flex justify-content-center mt-2">
              <Spinner animation="border" variant="light" size="sm" />
            </div>
          ) : currentPhotoTags.length > 0 ? (
            <div className="tagged-users-container mt-2">
              <small className="d-block mb-1">People in this photo:</small>
              {currentPhotoTags.map(taggedUser => (
                <span key={taggedUser.tag.id} className="tagged-user-pill">
                  {taggedUser.user.firstName} {taggedUser.user.lastName}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}
      
      {/* IMPORTANT: Added duplicated tag button at the bottom for maximum visibility */}
      {showTagButton && (
        <Container fluid className="mt-3">
          <Row className="justify-content-center">
            <Col xs={12} className="text-center">
              <Button
                variant="danger"
                size="lg"
                className="super-visible-tag-button"
                onClick={handleTagPeople}
              >
                <TagFill className="me-2" /> TAG PEOPLE IN THIS PHOTO
              </Button>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default CustomPhotoCarousel;