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
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {/* Create Organization should only appear when an Admin is logged in */}
                <NavButton
                    to="/:eid/events/:id/upload"
                    className="mx-2 top-bar-element custom-create-button"
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

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        const { eid } = useParams();
        if (eid) {
            try {
                const photos = await getAllPhotos(eid);
                console.log(photos);
                setPhotos(prev => [...prev, ...photos.data.photos]);
            } catch (err) {
                setError('Failed to fetch photos.');
            }
        } else {
            setError('EventId is empty.');
        }
    };

    return (
        <>
            <Row className="g-0">
                <Col md="auto">
                    <Sidebar />
                </Col>
                <Col style={{ flex: 1, marginLeft: '200px' }}>
                    <Row>
                        <TopBar
                            searchComponent={searchComponent}
                            rightComponents={rightComponents}
                        />
                    </Row>
                    <div className="p-3 bg-dark text-white">
                        <Row>
                            <h1 className="mb-4">Photos</h1>
                        </Row>
                        <Row>
                            {error && <p className="text-red-500">{error}</p>}

                            {photos.map(photo => (
                                <Col>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <GalleryCard
                                            key={photo.id}
                                            item={photo}
                                            className={`photo-card`}
                                        />
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
