import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { Col, Row, Button, Container } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import { NavLink } from 'react-router-dom';
import OrganizationRow from '../../components/organizationRow/OrganizationRow';
import {
    Organization,
    Event,
    getPublicOrganizations,
    getPublicOrganizationEvents,
} from '../../context/OrgService';

const Home = () => {
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [organizationsWithEvents, setOrganizationsWithEvents] = useState<
        (Organization & { events?: Event[] })[]
    >([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState<
        (Organization & { events?: Event[] })[]
    >([]);
    const [displayCount, setDisplayCount] = useState<number>(3); // Start with 3 rows
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
    const [allOrganizationsLoaded, setAllOrganizationsLoaded] = useState<boolean>(false);

    const fetchOrganizations = async (key: string | undefined = undefined) => {
        try {
            setLoading(true);
            const response = await getPublicOrganizations(key);

            let newOrganizations: Organization[];
            if (key) {
                newOrganizations = [...organizations, ...response.data.organizations];
                setOrganizations(newOrganizations);
            } else {
                newOrganizations = response.data.organizations;
                setOrganizations(newOrganizations);
            }

            setLastEvaluatedKey(response.lastEvaluatedKey);
            setAllOrganizationsLoaded(response.lastEvaluatedKey === null);

            // Fetch events for each organization
            await fetchEventsForOrganizations(newOrganizations);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching organizations:', err);
            setError('Failed to load organizations. Please try again later.');
            setLoading(false);
        }
    };

    const fetchEventsForOrganizations = async (orgs: Organization[]) => {
        setLoadingEvents(true);
        const orgsWithEvents = [...organizationsWithEvents];

        // Only fetch events for organizations we don't already have events for
        const orgsToFetch = orgs.filter(
            org => !orgsWithEvents.some(existingOrg => existingOrg.id === org.id)
        );

        if (orgsToFetch.length === 0) {
            setLoadingEvents(false);
            return;
        }

        try {
            // Fetch events for each organization in parallel
            const eventsPromises = orgsToFetch.map(async org => {
                try {
                    const eventsResponse = await getPublicOrganizationEvents(org.id);
                    return {
                        ...org,
                        events: eventsResponse.data.events,
                    };
                } catch (error) {
                    console.error(`Error fetching events for org ${org.id}:`, error);
                    return {
                        ...org,
                        events: [],
                    };
                }
            });

            const orgsWithNewEvents = await Promise.all(eventsPromises);

            // Merge with existing organizations that already have events
            const existingOrgsWithEvents = orgsWithEvents.filter(
                org => !orgsToFetch.some(newOrg => newOrg.id === org.id)
            );

            const allOrgsWithEvents = [...existingOrgsWithEvents, ...orgsWithNewEvents];
            setOrganizationsWithEvents(allOrgsWithEvents);

            // Initial filtering
            if (searchTerm) {
                filterOrganizationsAndEvents(allOrgsWithEvents, searchTerm);
            } else {
                setFilteredOrganizations(allOrgsWithEvents);
            }
        } catch (err) {
            console.error('Error fetching events for organizations:', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();

        // Set up a timer to refresh organizations every 45 minutes to get fresh presigned URLs
        const refreshInterval = setInterval(
            () => {
                console.log('Refreshing organization data to update presigned URLs');
                fetchOrganizations();
            },
            45 * 60 * 1000
        ); // 45 minutes in milliseconds

        // Cleanup the interval when component unmounts
        return () => clearInterval(refreshInterval);
    }, []);

    const filterOrganizationsAndEvents = (
        orgs: (Organization & { events?: Event[] })[],
        term: string
    ) => {
        if (!term.trim()) {
            setFilteredOrganizations(orgs);
            return;
        }

        const lowerCaseSearchTerm = term.toLowerCase();
        const filtered = orgs.filter(org => {
            // Check if organization name matches search term
            if (org.name.toLowerCase().includes(lowerCaseSearchTerm)) {
                return true;
            }

            // Check if any event title matches search term
            if (
                org.events &&
                org.events.some(event => event.title.toLowerCase().includes(lowerCaseSearchTerm))
            ) {
                return true;
            }

            return false;
        });

        setFilteredOrganizations(filtered);
    };

    // Filter organizations whenever searchTerm changes
    useEffect(() => {
        filterOrganizationsAndEvents(organizationsWithEvents, searchTerm);
        // Reset display count when new search is performed
        setDisplayCount(3);
    }, [searchTerm, organizationsWithEvents]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Search is already handled by the useEffect for live filtering
    };

    const handleLoadMore = () => {
        if (searchTerm.trim() === '') {
            // When not filtering, load more from API if needed
            if (displayCount >= organizations.length && lastEvaluatedKey) {
                fetchOrganizations(lastEvaluatedKey);
            }
        }
        // Increase display count in either case
        setDisplayCount(prev => prev + 3);
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search organizations or events..."
            className="ms-2"
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
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

    // Use filteredOrganizations instead of organizations directly
    const displayedOrganizations = filteredOrganizations.slice(0, displayCount);
    const hasMoreToDisplay =
        searchTerm.trim() === ''
            ? displayCount < organizations.length || !allOrganizationsLoaded
            : displayCount < filteredOrganizations.length;

    return (
        <>
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />
                    <Container fluid className="px-4 py-3">
                        <h1 className="mb-4 page-title">Organizations & Events</h1>
                        {loading && organizations.length === 0 ? (
                            <div className="text-center p-5">Loading organizations...</div>
                        ) : loadingEvents && organizationsWithEvents.length === 0 ? (
                            <div className="text-center p-5">Loading events...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : displayedOrganizations.length === 0 ? (
                            <div className="text-center p-5">
                                {searchTerm.trim() !== ''
                                    ? `No organizations or events found matching "${searchTerm}"`
                                    : 'No organizations found.'}
                            </div>
                        ) : (
                            <>
                                {/* Organization Rows */}
                                {displayedOrganizations.map(org => (
                                    <OrganizationRow key={org.id} organization={org} />
                                ))}
                                {/* Load More Button - show if more orgs to display */}
                                {hasMoreToDisplay && (
                                    <div className="text-center mt-4 mb-4">
                                        <Button
                                            variant="primary"
                                            onClick={handleLoadMore}
                                            disabled={loading || loadingEvents}
                                        >
                                            {loading || loadingEvents ? 'Loading...' : 'Load More'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Container>
                </Col>
            </Row>
        </>
    );
};

export default Home;
