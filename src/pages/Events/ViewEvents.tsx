import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
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
    const [loading, setLoading] = useState<boolean>(false);
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
                        {/* Apply to Organization should only appear when an user who is not part of an org is logged in */}
                        {/* <NavButton
                            to="/organizations/:id/apply"
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Apply to Organization
                        </NavButton> */}

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
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        const initialize = async () => {
            setLoading(true);
            const newOrgs = await fetchOrganizations();
            //console.log(newOrgs)
            await fetchEventsForOrganizations(newOrgs);
            // console.log(newEvents)
            setLoading(false);
        };

        initialize();
    }, []);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
    
        let allFetched = true;
        const newEvents: Event[] = [];
        const updatedKeys: Record<string, string | null> = { ...lastEvaluatedKeyOrgEvent };
    
        // Fetch more events for current orgs
        for (const org of organizations) { // Use `organizations` here
            const nextKey = lastEvaluatedKeyOrgEvent[org.id];
            if (nextKey !== null) {
                try {
                    const res = await getPublicOrganizationEvents(org.id, nextKey);
                    newEvents.push(...res.data.events);
                    updatedKeys[org.id] = res.lastEvaluatedKey ?? null;
    
                    if (res.lastEvaluatedKey !== null) {
                        allFetched = false;
                    }
                } catch {
                    console.error(`Error fetching more events for org ${org.id}`);
                }
            }
        }
    
        setEvents(prev => [...prev, ...newEvents]);
        setlastEvaluatedKeyOrgEvent(updatedKeys);
    
        // If all events were fetched, try fetching more orgs
        let newOrgKey = lastEvaluatedKeyOrg;
        let moreOrgsFetched = false;
        if (allFetched && lastEvaluatedKeyOrg !== null) {
            const newOrgs = await fetchOrganizations(lastEvaluatedKeyOrg);
            if(newOrgs) {
                await fetchEventsForOrganizations(newOrgs);
                newOrgKey = newOrgs.data.organizations.length > 0 ? newOrgs.lastEvaluatedKey : null; // Use newOrgs to get the key
                moreOrgsFetched = newOrgs.data.organizations.length > 0 ? true : false;
            }
            
        }
    
        // Determine if there's more data
        const anyOrgHasMoreEvents = Object.values(updatedKeys).some(k => k !== null);
        const canFetchMoreOrgs = newOrgKey !== null;
    
        console.log('Has more events:', anyOrgHasMoreEvents);
        console.log('Has more orgs:', canFetchMoreOrgs);
    
        setHasMore(canFetchMoreOrgs);
        setLoading(false);
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
                            {error && <p className="text-red-500">{error}</p>}

                            {events.length === 0 && !loading ? (
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
                                events.map(event => (
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
                            
                            <div className="text-center mt-4 mb-4">
                                {hasMore && (
                                    <div className="text-center mt-4 mb-4">
                                        <Button
                                            onClick={loadMore}
                                            disabled={loading}
                                            //className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {loading ? 'Loading...' : 'Load More'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Events;