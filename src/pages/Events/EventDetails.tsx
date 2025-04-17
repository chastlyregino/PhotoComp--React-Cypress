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
import { Event, getOrganizationEvents, getWeather, getUpdateWeather} from '../../context/OrgService';
import { isMemberOfOrg } from '../../context/AuthService';

const renderWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) {
        return <icon.SunFill size={24} className="text-warning" />;
    }
    else if (code === 2) {
        return <icon.CloudSunFill size={24} className="text-light" />;
    }
    else if (code === 3) {
        return <icon.CloudFill size={24} className="text-light" />;
    }
    else if (code === 45 || code === 48) {
        return <icon.CloudFog2Fill size={24} className="text-light" />;
    }
    else if (code >= 51 && code <= 57 || code === 61) {
        return <icon.CloudDrizzleFill size={24} className="text-info" />;
    }
    else if (code === 63 || code === 65) {
        return <icon.CloudRainFill size={24} className="text-info" />;
    }
    else if (code === 66 || code === 67) {
        return <icon.CloudSleetFill size={24} className="text-info" />;
    }
    else if (code >= 71 && code <= 77 || code === 85 || code === 86) {
        return <icon.CloudSnowFill size={24} className="text-light" />;
    }
    else if (code >= 80 && code <= 82) {
        return <icon.CloudRainHeavyFill size={24} className="text-info" />;
    }
    else if (code >= 95 && code <= 99) {
        return <icon.CloudLightningRainFill size={24} className="text-warning" />;
    }
    else {
        return <icon.CloudFill size={24} className="text-light" />;
    }
};


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
                
                if (user && token) {
                    try {
                        const reply = await isMemberOfOrg(user.id, id);
                        const userRelationRecord = reply.data.data;
                        setMemberRole(userRelationRecord.membership.role);
                    } catch (membershipError) {
                        console.error(`Error checking membership status: ${membershipError}`);
                    }
                }
                
                // Fetch event details
                const response = await getOrganizationEvents(id);
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

    const handleAddWeather = async () => {
        if (!id || !eid || !event) return;
        
        try {
            setLoading(true);
            const response = await getWeather(event.location as string, id, eid);
            if (response.data?.event) {
                setEvent(prevEvent => ({
                    ...prevEvent,
                    ...response.data.event,
                }));
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error updating weather data:', error);
            setError('Failed to update weather data. Please try again.');
            setLoading(false);
        }
    }

    const handleRefreshWeather = async () => {
        if (!id || !eid || !event) return;
        
        try {
            setLoading(true);
            const response = await getUpdateWeather(id, eid);
            if (response.data?.event) {
                setEvent(prevEvent => ({
                    ...prevEvent,
                    ...response.data.event,
                }));
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error updating weather data:', error);
            setError('Failed to update weather data. Please try again.');
            setLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMMM d, yyyy');
        } catch (error) {
            console.log(error);
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
                                                {event.weather && (
                                                    <div className="event-weather mt-2 p-2 rounded">
                                                        <h5 className="text-light mb-1">Weather Forecast</h5>
                                                        <div className="d-flex align-items-center">
                                                            <div className="weather-icon me-2">
                                                                {renderWeatherIcon(event.weather.weatherCode)}
                                                            </div>
                                                            <div>
                                                                <p className="mb-1">{event.weather.weatherDescription} | {Math.round((event.weather.temperature * 9/5) + 32)}°F</p>
                                                                <p className="mb-0 small">
                                                                    <icon.Wind className="me-1" />
                                                                    Wind: {Math.round(event.weather.windSpeed * 0.621371)} mph | 
                                                                    <icon.Droplet className="mx-1" />
                                                                    Precipitation: {Math.round(event.weather.precipitation / 25.5)} in 
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                                                {event.location && (
                                                  <div className="mb-4">
                                                      <h4 className="text-light mb-2">Location</h4>
                                                      <p className="lead">{typeof event.location == 'string' ? event.location : event.location.name}</p>
                                                  </div>
                                                )}
                                                
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
                                                      {event.location && (
                                                        <Button 
                                                            variant="outline-light"
                                                            onClick={() => event.weather ? handleRefreshWeather() :handleAddWeather()}
                                                        >
                                                            <icon.Cloud className="me-2" />
                                                            {loading ? 'Updating...' : (event.weather ? 'Refresh Weather' : 'Add Weather')}
                                                        </Button>
                                                      )}
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
