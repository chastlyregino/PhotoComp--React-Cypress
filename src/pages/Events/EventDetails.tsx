import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import * as icon from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';

import AuthContext from '../../context/AuthContext';
import { Event, getPublicOrganizationEvents } from '../../context/OrgService';
import { isMemberOfOrg } from '../../context/AuthService';

const EventDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id, eid } = useParams<{ id: string; eid: string }>();
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');

    const [memberRole, setMemberRole] = useState<string | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    

    useEffect(() => {
        if (!id || !eid) return;

        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if user is a member of the organization
                if (user && token) {
                    try {
                        const reply = await isMemberOfOrg(user.id, id);
                        const userRelationRecord = reply.data.data;
                        setMemberRole(userRelationRecord.membership.role);
                    } catch (membershipError) {
                        console.error(`Error checking membership status: ${membershipError}`);
                        // User is not a member, continue fetching public event
                    }
                }
                
                // Fetch event details
                const response = await getPublicOrganizationEvents(id);
                const foundEvent = response.data.events.find(event => event.id === eid);
                
                if (foundEvent) {
                    setEvent(foundEvent);
                } else {
                    setError('Event not found');
                }
                
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching event details for event ${eid}:`, err);
                setError(`Failed to load event details. Please try again later.`);
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id, eid, user, token]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMMM d, yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Components to be injected into the TopBar
    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search events..."
            className="ms-3"
        />
    );
    
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        {/* Create Event should only appear when an admin user is logged in */}
                        {memberRole === 'ADMIN' && (
                            <NavButton
                                to={`/organizations/${id}/events/create`}
                                variant="outline-light"
                                className="mx-1 top-bar-element"
                            >
                                Create Event
                            </NavButton>
                        )}

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
                        {/* Only show Members link if user is a member or admin */}
                        {memberRole === 'ADMIN' && (
                            <NavLink to={`/organizations/${id}/members`} className="text-light top-bar-element">
                                <icon.PersonLinesFill size={24} />
                            </NavLink>
                        )}
                        <NavButton 
                            to={`/organizations/${id}/events/${eid}/photos`}
                            variant="outline-light"
                            className="top-bar-element"
                        >
                            View Photos
                        </NavButton>
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
                        <Container>
                            <Row className="align-items-center mb-4">
                                <Col>
                                    <h1 className="mb-4">Event Details</h1>
                                </Col>
                                <Col xs="auto" className="ms-auto me-5">
                                    {pageActionComponents}
                                </Col>
                            </Row>
                            
                            {error && (
                                <Alert variant="danger">{error}</Alert>
                            )}

                            {loading ? (
                                <div className="text-center p-5">Loading event details...</div>
                            ) : event ? (
                                <Row>
                                    <Col md={8}>
                                        <Card className="bg-dark text-white border-secondary mb-4">
                                            <Card.Header className="border-secondary">
                                                <h2>{event.title}</h2>
                                                <p className="text-light mb-0">Organized by {id && id.charAt(0).toUpperCase() + id.slice(1)}</p>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row className="mb-3">
                                                    <Col xs={12} md={6}>
                                                        <div className="mb-3">
                                                            <h5 className="text-light mb-1">Date</h5>
                                                            <p>{formatDate(event.date)}</p>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6}>
                                                        <div className="mb-3">
                                                            <h5 className="text-light mb-1">Privacy</h5>
                                                            <p>
                                                                {event.isPublic ? (
                                                                    <span><icon.UnlockFill className="me-2" />Public</span>
                                                                ) : (
                                                                    <span><icon.LockFill className="me-2" />Private</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                
                                                <div className="mb-4">
                                                    <h4 className="text-light mb-3">Description</h4>
                                                    <p className="lead">{event.description}</p>
                                                </div>
                                                
                                                <Row className="mt-4">
                                                    <Col>
                                                        <div className="d-flex gap-3">
                                                            <NavButton
                                                                to={`/organizations/${id}/events/${eid}/photos`}
                                                                variant="outline-light"
                                                            >
                                                                Back to Event
                                                            </NavButton>
                                                            
                                                            {user && token && (
                                                                <NavButton
                                                                    to={`/organizations/${id}/events/${eid}/photos`}
                                                                    variant="secondary"
                                                                >
                                                                    View Photos
                                                                </NavButton>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                            <Card.Footer className="text-light border-secondary">
                                                <small>Created: {formatDate(event.createdAt)}</small>
                                                {event.updatedAt !== event.createdAt && (
                                                    <small className="ms-3">Updated: {formatDate(event.updatedAt)}</small>
                                                )}
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                    
                                    <Col md={4}>
                                        {event.imageUrl && (
                                            <Card className="bg-dark text-white border-secondary mb-4">
                                                <Card.Img 
                                                    variant="top" 
                                                    src={event.imageUrl} 
                                                    alt={event.title}
                                                    className="img-fluid"
                                                />
                                            </Card>
                                        )}
                                        
                                        <Card className="bg-dark text-white border-secondary">
                                            <Card.Header className="border-secondary">
                                                <h4>Event Information</h4>
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="mb-3">
                                                    <h5 className="text-light mb-1">Event ID</h5>
                                                    <p className="text-light">{event.id}</p>
                                                </div>
                                                
                                                {user && token && memberRole === 'ADMIN' && (
                                                    <div className="d-grid gap-2 mt-4">
                                                        <Button 
                                                            variant="outline-light"
                                                            onClick={() => navigate(`/organizations/${id}/events/${eid}/edit`)}
                                                        >
                                                            <icon.PencilFill className="me-2" />
                                                            Edit Event
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger"
                                                        >
                                                            <icon.TrashFill className="me-2" />
                                                            Delete Event
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            ) : (
                                <div className="text-center p-5">
                                    <h3>Event not found</h3>
                                    <p>The event you're looking for doesn't exist or has been removed.</p>
                                    <NavButton 
                                        to={`/organizations/${id}/events/${eid}`}
                                        variant="outline-light"
                                        className="mt-3"
                                    >
                                        Back to Event
                                    </NavButton>
                                </div>
                            )}
                        </Container>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default EventDetails;
