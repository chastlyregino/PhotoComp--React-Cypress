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
import {
    EventResponse,
    changeEventPublicity,
    getOrganizationEvents,
} from '../../context/OrgService';
import {
    attendEvent,
    getEventAttendees,
    EventUserResponse,
    attendeesResponse,
    EventUser,
} from '../../context/EventService';
import { UserOrgRelationship, isMemberOfOrg } from '../../context/AuthService';

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
    const [isMember, setIsMember] = useState<UserOrgRelationship | null>(null);
    const [isEventAttendee, setIsEventAttendee] = useState<EventUser | null>(null);
    const [eventPublicity, setEventPublicity] = useState<boolean | null>(null);
    const fetchedRef = useRef(false);
    const { id, eid } = useParams();

    // Fetch event details
    // useEffect(() => {
    //     if (id && eid) {
    //         const fetchEventDetails = async () => {
    //             try {
    //                 setLoadingEvent(true);
    //                 const response = await getPublicOrganizationEvents(id);
    //                 const event = response.data.events.find(e => e.id === eid);
                    
    //                 if (event) {
    //                     setEventInfo(event);
    //                 }
                    
    //                 setLoadingEvent(false);
    //             } catch (err) {
    //                 console.error('Error fetching event details:', err);
    //                 setLoadingEvent(false);
    //             }
    //         };
            
    //         fetchEventDetails();
    //     }
    // }, [id, eid]);

    // Fetch photos
    // useEffect(() => {
    //     if (fetchedRef.current) return;
    //     fetchedRef.current = true;
    //     fetchPhotos();
    // }, [id, eid]);

    // useEffect(() => {
    //     if (searchTerm.trim() === '') {
    //         setFilteredPhotos(photos);
    //     } else {
    //         const filtered = photos.filter(photo => {
    //             // Search in photo metadata if available
    //             const title = photo.metadata?.title?.toLowerCase() || '';
    //             const description = photo.metadata?.description?.toLowerCase() || '';
    //             const searchLower = searchTerm.toLowerCase();
                
    //             return title.includes(searchLower) || description.includes(searchLower);
    //         });
    //         setFilteredPhotos(filtered);
    //     }
    // }, [photos, searchTerm]);

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
        checkIfAdmin();
        fetchEventAttendees();
        fetchEventPublicity();
        fetchPhotos();
        fetchUserRole();
        fetchEventDetails();
    }, []);

    useEffect(() => {
        fetchEventPublicity();
    }, []);

    const fetchEventDetails = async () => {
        if(id) {
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
        }
        
    };

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

    const fetchUserRole = async (): Promise<UserOrgRelationship | undefined> => {
        if (id && user) {
            try {
                const member = await isMemberOfOrg(user.id, id);
                setIsMember(member.data.data.membership)

                return member.data.data.membership;
            } catch (error) {
                console.error(`Error fetching the member ${id}:`, error);
                throw error;
            }
        }
    };

    const checkIfAdmin = async () => {
        try {
            if (!id || !user) return;

            const result = await fetchUserRole();
            console.log(`userRole: ${result}`)
            if (result) {
                setIsAdminUser(result.role === 'ADMIN');
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            // Optionally: setError('Could not verify admin status');
        }
    };

    const changePublicity = async () => {
        if (id && eid) {
            try {
                // Immediately toggle UI for better user feedback
                setEventPublicity(prev => !prev);
                
                // Then make the API call
                const response = await changeEventPublicity(id, eid);
                
                // If API call fails, we'll revert in the catch block
                console.log("Event publicity API response:", response);
            } catch (error) {
                console.error(`Error changing event publicity ${eid}:`, error);
                // Revert UI state if API call fails
                setEventPublicity(prev => !prev);
                setError('Failed to change event publicity');
            }
        }
    };

    const fetchEventAttendees = async () => {
        if (id && eid && user) {
            try {
                const attendees = await getEventAttendees(id, eid);
                if(attendees) {
                    const isAttending = attendees.find(attendee => attendee as unknown as string === user.id);
                    console.log(isAttending)
                    if (isAttending) {
                        setIsEventAttendee(isAttending);
                    }
                }
                
            } catch (error) {
                console.error(`Error fetching attendees for event ${eid}:`, error);
            }
        }
    };

    const handleAttendEvent = async () => {
        if (!id || !eid || !user) return;

        try {
            const response = await attendEvent(id, eid);
            console.log(`attendees: ${response}`)
            if (response && response.data && response.data.userEvent) {
                setIsEventAttendee(response.data.userEvent); // ✅ Mark user as attending
            }
        } catch (error) {
            console.error(`Failed to attend event ${eid}:`, error);
            setError('Could not attend the event.');
        }
    };

    const fetchEventPublicity = async () => {
        if (!id || !eid) return;

        try {
            const response = await getOrganizationEvents(id);
            const event = response.data.events.find(e => e.id === eid);

            if (event && typeof event.isPublic === 'boolean') {
                setEventPublicity(event.isPublic); // Update state with the actual event's publicity value
            } else {
                console.warn(`Event ${eid} not found in organization ${id}`);
            }
        } catch (error) {
            console.error(`Error fetching publicity for event ${eid}:`, error);
            setError('Could not load event publicity.');
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
                {/* Create Organization should only appear when an Admin is logged in */}
                
                {isAdminUser &&(
                <NavButton
                    to={`/organizations/${id}/events/${eid}/photos/upload`}
                    variant="outline-light"
                    className="mx-1 top-bar-element"
                >
                    Upload Photos
                </NavButton>
                )}
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
        <div className="d-flex align-items-center gap-3">
            {!isEventAttendee && isMember && (
                    <Button onClick={handleAttendEvent} className="top-bar-element custom-create-button">
                        Attend Event
                    </Button>
            )}
            
                {user &&
                    token &&
                    (isAdminUser ? (
                        <Button onClick={changePublicity} className="icon-only-button" key={`publicity-${eventPublicity}`}>
                            {eventPublicity ? (
                                <icon.UnlockFill size={20} />
                            ) : (
                                <icon.LockFill size={20} />
                            )}
                        </Button>
                    ) : eventPublicity ? (
                        <icon.UnlockFill size={24} />
                    ) : (
                        <icon.LockFill size={24} />
                    ))}

            <NavLink
                to={`/organizations/${id}/events/${eid}/details`}
                className="icon-only-button"
            >
                <icon.ListUl size={24} />
            </NavLink>
        </div>
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
                    <Row>
                        {error && <p className="text-red-500">{error}</p>}

                        {photos.map(photo => (
                            <Col>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    <div className="gallery-card photo">
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