import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OrganizationCard from "./OrganizationCard";

interface GalleryProps {
  items: { id: number }[];
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {items.map((item, _) => (
          <Col key={item.id} xs={12} sm={8} md={6} lg={4}>
            <OrganizationCard index={item.id} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Gallery;

