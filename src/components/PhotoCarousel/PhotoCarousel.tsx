import React, { useState } from 'react';
import { Carousel, Container, Row, Col } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import './PhotoCarousel.css';

// Interface for the photo data
interface Photo {
  id: string;
  imageUrl: string;
  event: string;
  description: string;
  time: string;
  tagged: boolean;
}

interface PhotoCarouselProps {
  photos: Photo[];
  initialIndex?: number;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ 
  photos, 
  initialIndex = 0 
}) => {
  const [index, setIndex] = useState(initialIndex);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  // Ensure we have photos to display
  if (!photos || photos.length === 0) {
    return (
      <Container className="text-center text-white">
        <p>No photos available to display</p>
      </Container>
    );
  }

  return (
    <Container className="photo-carousel-container my-4">
      <Row className="justify-content-center">
        <Col xs={12} className="text-start mb-3">
          <h2 className="text-white fw-normal" style={{ fontFamily: 'Michroma' }}>
            Photos : Adult Promotional Test
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