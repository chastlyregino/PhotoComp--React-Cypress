import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Search, Download, Heart, PersonCircle } from 'react-bootstrap-icons';
import PhotoCarousel from '../../components/PhotoCarousel/PhotoCarousel';


// Sample data for demonstration
const samplePhotos = [
  {
    id: '1',
    imageUrl: 'https://placehold.co/958x680',
    event: 'Promotional Test',
    description: 'Black Belt Candidates',
    time: 'May 2025',
    tagged: true
  },
  {
    id: '2',
    imageUrl: 'https://placehold.co/958x680',
    event: 'Tournament',
    description: 'Forms Competition',
    time: 'April 2025',
    tagged: false
  },
  {
    id: '3',
    imageUrl: 'https://placehold.co/958x680',
    event: 'Graduation Ceremony',
    description: 'Belt Promotion',
    time: 'March 2025',
    tagged: true
  }
];

const PhotoGalleryPage: React.FC = () => {
  return (
    <div className="photo-gallery-page bg-dark min-vh-100">
      {/* Header/Nav area */}
      <Container fluid className="py-3">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            {/* Search input */}
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-light text-dark"
                placeholder="SEARCH"
                style={{ fontFamily: 'Michroma' }}
                disabled
              />
              <span className="input-group-text bg-light">
                <Search />
              </span>
            </div>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-end gap-2 mt-3 mt-md-0">
            <Button variant="secondary" className="d-flex align-items-center gap-2">
              <Download /> Download Photo
            </Button>
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
      <PhotoCarousel photos={samplePhotos} />
    </div>
  );
};

export default PhotoGalleryPage;