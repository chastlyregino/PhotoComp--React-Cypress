// Updated src/pages/Events/ViewEvents.tsx with proper event filtering

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button, Col, Row, Alert } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink, useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import {
    Organization,
    Event,
    getPublicOrganizations,
    getPublicOrganizationEvents,
} from '../../context/OrgService';
import AuthContext from '../../context/AuthContext';

const Events: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [lastEvaluatedKeyOrg, setlastEvaluatedKeyOrg] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [lastEvaluatedKeyOrgEvent, setlastEvaluatedKeyOrgEvent] = useState<
        Record<string, string | null>
    >({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const fetchedRef = useRef(false);
    const { id } = useParams<{ id: string }>();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Search submitted:', searchTerm);
        // Implement your search logic here organizations
    };

    /* Components to be injected into the TopBar*/
    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search events..."
            className="ms-3"
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        {/* Create Event button for admin users */}
                        <NavButton
                            to={`/organizations/${id}/events/create`}
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Create Event
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
                        {/* PersonLinesFill icon should only appear when an admin user of an org is logged in */}
                        <NavLink
                            to={`/organizations/${id}/members`}
                            className="text-light top-bar-element"
                        >
                            <icon.PersonLinesFill size={24} />
                        </NavLink>
                        <NavLink
                            to={`/organizations/${id}/details`}
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

    const fetchOrganizations = async (key: string | undefined = undefined): Promise<Organization[]> => {
        setLoading(true);
        try {
            const orgs = await getPublicOrganizations(key);
            const newOrgs = orgs.data.organizations;
    
            if (key) {
                setOrganizations(prev => [...prev, ...newOrgs]);
            } else {
                setOrganizations(newOrgs);
            }
    
            setlastEvaluatedKeyOrg(orgs.lastEvaluatedKey);
            setHasMore(orgs.lastEvaluatedKey !== null);
            setLoading(false);
            console.log(newOrgs)
            return newOrgs;
        } catch (err) {
            setError('Failed to fetch organizations');
            setLoading(false);
            return [];
        }
    };
    

    const fetchEventsForOrganizations = async (orgs: Organization[]) => {
        const newEvents: Event[] = [];
        const newEventKeys: Record<string, string | null> = {};

        for (const org of orgs) {
            try {
                const res = await getPublicOrganizationEvents(org.name);
                // console.log(org.name)
                // console.log(res)
                newEvents.push(...res.data.events);
                newEventKeys[org.id] = res.lastEvaluatedKey ?? null;
            } catch {
                console.error(`Failed to fetch events for org ${org.id}`);
            }
        }

        setEvents(prev => [...prev, ...newEvents]);
        setlastEvaluatedKeyOrgEvent(prev => ({ ...prev, ...newEventKeys }));
    };

    useEffect(() => {
        // Reset state when organization ID changes
        setEvents([]);
        setLoading(true);
        setError(null);
        fetchedRef.current = false;
        
        // Now fetch events for this specific organization
        fetchEventsForOrganization();
    }, [id]); // Depend on the id parameter

    const fetchEventsForOrganization = async () => {
        if (!id) {
            setError('Organization ID is missing');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getPublicOrganizationEvents(id);
            
            if (response.data && response.data.events) {
                setEvents(response.data.events);
                setlastEvaluatedKeyOrgEvent({ [id]: response.lastEvaluatedKey });
                setHasMore(response.lastEvaluatedKey !== null);
            } else {
                // No events found, but that's ok - just show empty state
                setEvents([]);
                setHasMore(false);
            }
        } catch (err) {
            console.error(`Error fetching events for organization ${id}:`, err);
            setError('Failed to fetch events.');
        } finally {
            setLoading(false);
            fetchedRef.current = true;
        }
    };

    const loadMore = async () => {
        if (loading || !hasMore || !id) return;
        
        setLoading(true);
        try {
            const nextKey = lastEvaluatedKeyOrgEvent[id];
            const response = await getPublicOrganizationEvents(id, nextKey || undefined);
            
            if (response.data && response.data.events) {
                setEvents((prev: Event[]) => [...prev, ...response.data.events]);
                
                // Update pagination key for this specific organization
                setlastEvaluatedKeyOrgEvent((prev: Record<string, string | null>) => ({
                    ...prev,
                    [id]: response.lastEvaluatedKey
                }));
                
                setHasMore(response.lastEvaluatedKey !== null);
            }
        } catch (err) {
            console.error(`Error fetching more events for organization ${id}:`, err);
            setError('Failed to load more events.');
        } finally {
            setLoading(false);
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
                                <h1 className="mb-4">Events</h1>
                            </Col>

                            <Col xs="auto" className="ms-auto me-5">
                                {pageActionComponents}
                            </Col>
                        </Row>
                        <Row>
                            {error && <Alert variant="danger">{error}</Alert>}

                            {loading && events.length === 0 ? (
                                <div className="text-center p-5">
                                    <p>Loading events...</p>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center p-5">
                                    <p>No events found for this organization.</p>
                                    {user && token && (
                                        <Button 
                                            variant="primary" 
                                            onClick={() => navigate(`/organizations/${id}/events/create`)}
                                            className="mt-3"
                                        >
                                            Create Your First Event
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                events.map((event: Event) => (
                                    <Col key={event.id}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                            <GalleryCard
                                                item={event}
                                                className={`event-card`}
                                                orgName={event.GSI2PK}
                                            />
                                        </div>
                                    </Col>
                                ))
                            )}
                            
                            {hasMore && events.length > 0 && (
                                <div className="text-center mt-4 mb-4">
                                    <Button
                                        onClick={loadMore}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}
                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Events;