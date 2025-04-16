import React, { useState, useEffect, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink, useParams } from 'react-router-dom';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import { getAllPhotos } from '../../context/PhotoService';

const Photos: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [photos, setPhotos] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);
    const { id, eid } = useParams();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Search submitted:', searchTerm);
        // Implement your search logic here photos
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
                {/* Create Organization should only appear when an Admin is logged in */}
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
            </div>
        </>
    );

    const pageActionComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {/* Attend Event should only appear when an user has to yet to attend the event that is logged in */}
                <NavButton
                    to={`/organizations/${id}/events/${eid}/apply`}
                    variant="outline-light"
                    className="mx-1 top-bar-element"
                >
                    Attend Event
                </NavButton>

                {/* need to change the NavLink into just an icon when it is a user.
                    NavLink = Admin (logic of event privacy)
                    just button = Member */}
                <NavLink to={`/organizations/${id}/members`} className="text-light top-bar-element">
                    {/* change logic icon when private or public
                        unlock = public
                        lock = private */}
                    <icon.UnlockFill size={24} />
                </NavLink>
                <NavLink
                    to={`/organizations/${id}/events/${eid}/details`}
                    className="text-light top-bar-element"
                >
                    <icon.ListUl size={24} />
                </NavLink>
            </div>
        </>
    );

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        if (id && eid) {
            try {
                const photos = await getAllPhotos(id, eid);
                console.log(photos);
                setPhotos(prev => [...prev, ...photos.data.photos]);
            } catch (err) {
                setError('Failed to fetch photos.');
            }
        } else {
            setError('Org name or EventId is empty.');
        }
    };

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
                        <Row>
                            {error && <p className="text-red-500">{error}</p>}

                            {photos.map(photo => (
                                <Col>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    <div className="gallery-card photo card-image">
                                    {/* <div className="gallery-card photo"> */}
                                        <GalleryCard
                                            key={photo.id}
                                            item={photo}
                                            className={`photo-card`}
                                            orgName={id}
                                        />
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Photos;
