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
import { getPublicOrganizationEvents, Event } from '../../context/OrgService';
import AuthContext from '../../context/AuthContext';
import { EventsResponse, changeEventPublicity } from '../../context/OrgService';
import { isMemberOfOrg } from '../../context/AuthService';

const Photos: React.FC = () => {
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [eventInfo, setEventInfo] = useState<Event | null>(null);
    const [loadingEvent, setLoadingEvent] = useState<boolean>(true);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const fetchedRef = useRef(false);
    const { id, eid } = useParams();

    // Fetch event details
    useEffect(() => {
        if (id && eid) {
            const fetchEventDetails = async () => {
                try {
                    setLoadingEvent(true);
                    const response = await getPublicOrganizationEvents(id);
                    const event = response.data.events.find(e => e.id === eid);
                    
                    if (event) {
                        setEventInfo(event);
                    }
                    
                    setLoadingEvent(false);
                } catch (err) {
                    console.error('Error fetching event details:', err);
                    setLoadingEvent(false);
                }
            };
            
            fetchEventDetails();
        }
    }, [id, eid]);

    // Fetch photos
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
        console.log('Search submitted:', searchTerm);
        // Implement your search logic here photos
    };

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchPhotos();
        checkIfAdmin();
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

    // const fetchUserRole = async (): Promise<UserOrgRelationship | undefined> => {
    //     if (id && user) {
    //         try {
    //             const member = await isMemberOfOrg(id, user.id );
    
    //             return member.data.data.membership;
    //         } catch (error) {
    //             console.error(`Error fetching the member ${id}:`, error);
    //             throw error;
    //         }
    //     }
        
    // }

    // const isAdmin  = async () => {
    //     try {
    //         if (!id || !user) return;
    
    //         const result = await isMemberOfOrg(user.id, id);
    //         const role = result?.data?.data?.membership?.role;
    
    //         setIsAdminUser(role === 'ADMIN');
    //     } catch (error) {
    //         console.error('Error checking admin status:', error);
    //         // Optionally: setError('Could not verify admin status');
    //     }
    // }

    const changePublicity = async (): Promise<EventsResponse | undefined> => {
        if(id && eid) {
            try {
                return await changeEventPublicity(id, eid)
            } catch (error) {
                console.error(`Error changing event publicity ${eid}:`, error);
                throw error;
            }
        }
        
    }

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

                {/* need to change the NavLink into just an icon when it is a user.
                    NavLink = Admin (logic of event privacy)
                    just button = Member */}
                {user && token && (
                    isAdminUser ? (
                            <Button onClick={changePublicity}>
                                <icon.UnlockFill size={24} />
                            </Button>
                    ) : (
                            <icon.UnlockFill size={24} />
                    )
                )} 
                <NavLink
                    to={`/organizations/${id}/events/${eid}/details`}
                    className="text-light top-bar-element"
                >
                    <icon.ListUl size={24} />
                </NavLink>
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
                                {loadingEvent ? (
                                    <h1 className="mb-4">Loading event details...</h1>
                                ) : eventInfo ? (
                                    <div className="d-flex align-items-center flex-wrap mb-4">
                                        <h1 className="mb-0 me-3">{eventInfo.title}</h1>
                                        {eventInfo.description && (
                                            <span className="text-secondary fs-5">
                                                - {eventInfo.description}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <h1 className="mb-4">Photos</h1>
                                )}
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
                                        <NavButton
                                            to={`/organizations/${id}/events/${eid}/photos/upload`}
                                            variant="primary"
                                        >
                                            Upload Your First Photo
                                        </NavButton>
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