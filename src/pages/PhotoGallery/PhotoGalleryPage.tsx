import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Search, Download, Heart, PersonCircle } from 'react-bootstrap-icons';
import PhotoCarousel from '../../components/PhotoCarousel/PhotoCarousel';

const PhotoGalleryPage: React.FC = () => {
  // We can pass specific org/event IDs here if needed
  // or leave them blank to auto-fetch the first event's photos
  const orgName = "TestOrg"; // The org created in Postman
  
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

      {/* Main carousel section - connected to API */}
      <PhotoCarousel orgName={orgName} />
    </div>
  );
};

export default PhotoGalleryPage;