import React, { useState, useEffect, useRef, useContext } from 'react';
import { Col, Row, Button, Alert } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink, useParams } from 'react-router-dom';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import { getAllPhotos, Photo } from '../../context/PhotoService';
import AuthContext from '../../context/AuthContext';

const Photos: React.FC = () => {
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const fetchedRef = useRef(false);
    const { id, eid } = useParams();

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchPhotos();
    }, [id, eid]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPhotos(photos);
        } else {
            const filtered = photos.filter(photo => {
                // Search in photo metadata if available
                const title = photo.metadata?.title?.toLowerCase() || '';
                const description = photo.metadata?.description?.toLowerCase() || '';
                const searchLower = searchTerm.toLowerCase();
                
                return title.includes(searchLower) || description.includes(searchLower);
            });
            setFilteredPhotos(filtered);
        }
    }, [photos, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const fetchPhotos = async () => {
        if (id && eid) {
            try {
                setLoading(true);
                const response = await getAllPhotos(id, eid);
                setPhotos(response.data.photos);
                setFilteredPhotos(response.data.photos);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching photos:', err);
                setError('Failed to fetch photos. Please try again later.');
                setLoading(false);
            }
        } else {
            setError('Organization name or Event ID is missing.');
            setLoading(false);
        }
    };

    /* Components to be injected into the TopBar*/
    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search Photos..."
            className="ms-3"
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        <NavButton
                            to={`/organizations/${id}/events/${eid}/photos/upload`}
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Upload Photos
                        </NavButton>
                        <NavLink to="/account-settings" className="text-light top-bar-element">
                            <icon.GearFill size={24} />
                        </NavLink>
                        <NavLink to="/logout" className="text-light top-bar-element">
                            <icon.BoxArrowRight size={24} />
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavButton
                            to="/register"
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Register
                        </NavButton>
                        <NavButton to="/login" variant="outline-light" className="top-bar-element">
                            Login
                        </NavButton>
                    </>
                )}
            </div>
        </>
    );

    const pageActionComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        {/* Attend Event button for users who haven't registered for the event */}
                        <NavButton
                            to={`/organizations/${id}/events/${eid}/apply`}
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Attend Event
                        </NavButton>

                        {/* Privacy icon - lock/unlock based on event privacy */}
                        <NavLink 
                            to={`/organizations/${id}/members`} 
                            className="text-light top-bar-element"
                        >
                            <icon.UnlockFill size={24} />
                        </NavLink>
                        
                        {/* Event details */}
                        <NavLink
                            to={`/organizations/${id}/events/${eid}/details`}
                            className="text-light top-bar-element"
                        >
                            <icon.ListUl size={24} />
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavButton
                            to="/register"
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Register
                        </NavButton>
                        <NavButton to="/login" variant="outline-light" className="top-bar-element">
                            Login
                        </NavButton>
                    </>
                )}
            </div>
        </>
    );

    return (
        <>
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <div className="sticky-top bg-dark z-3">
                        <Row>
                            <TopBar
                                searchComponent={searchComponent}
                                rightComponents={rightComponents}
                            />
                        </Row>
                    </div>
                    <div className="p-3 bg-dark text-white">
                        <Row className="align-items-center mb-4">
                            <Col>
                                <h1 className="mb-4">Photos</h1>
                            </Col>

                            <Col xs="auto" className="ms-auto me-5">
                                {pageActionComponents}
                            </Col>
                        </Row>
                        
                        {error && (
                            <Alert variant="danger" className="mb-4">
                                {error}
                            </Alert>
                        )}
                        
                        {loading ? (
                            <div className="text-center p-5">Loading photos...</div>
                        ) : filteredPhotos.length === 0 ? (
                            <div className="text-center p-5">
                                {searchTerm ? 'No matching photos found.' : 'No photos available for this event.'}
                                
                                {user && token && (
                                    <div className="mt-4">
                                        <Button 
                                            variant="primary" 
                                            as={NavLink} 
                                            to={`/organizations/${id}/events/${eid}/photos/upload`}
                                        >
                                            Upload Your First Photo
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Row className="g-4">
                                {filteredPhotos.map(photo => (
                                    <Col key={photo.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                                        <GalleryCard
                                            item={photo}
                                            className="photo-card"
                                            orgName={id}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Photos;