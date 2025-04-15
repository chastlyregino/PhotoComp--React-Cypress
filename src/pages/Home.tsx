import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Col, Row, Button, Container } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';

import Sidebar from '../components/bars/SideBar/SideBar';
import TopBar from '../components/bars/TopBar/TopBar';
import SearchBar from '../components/bars/SearchBar/SearchBar';
import NavButton from '../components/navButton/NavButton';
import { NavLink } from 'react-router-dom';
import OrganizationRow from '../components/organizationRow/OrganizationRow';
import { Organization, getPublicOrganizations } from '../context/OrgService';

const Home = () => {
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [displayCount, setDisplayCount] = useState<number>(3); // Start with 3 rows
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
    const [allOrganizationsLoaded, setAllOrganizationsLoaded] = useState<boolean>(false);

    const fetchOrganizations = async (key: string | undefined = undefined) => {
        try {
            setLoading(true);

            const response = await getPublicOrganizations(key);

            if (key) {
                setOrganizations(prev => [...prev, ...response.data.organizations]);
            } else {
                setOrganizations(response.data.organizations);
            }

            setLastEvaluatedKey(response.lastEvaluatedKey);
            setAllOrganizationsLoaded(response.lastEvaluatedKey === null);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching organizations:', err);
            setError('Failed to load organizations. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Search submitted:', searchTerm);
        // searching
    };

    const handleLoadMore = () => {
        if (displayCount >= organizations.length) {
            if (lastEvaluatedKey) {
                fetchOrganizations(lastEvaluatedKey);
            }
        }
        setDisplayCount(prev => prev + 3);
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search organizations..."
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
                        <NavButton to='/register' variant="outline-light" className="mx-2 top-bar-element">
                            Register
                        </NavButton>
                        <NavButton to='/login' variant="outline-light" className="top-bar-element">
                            Login
                        </NavButton>
                    </>
                )}
                
            </div>
        </>
      );

    const displayedOrganizations = organizations.slice(0, displayCount);
    

    return (
        <>
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />

                    <Container fluid className="px-4 py-3">
                        <h1 className="mb-4 page-title">Organizations & Event</h1>

                        {loading && organizations.length === 0 ? (
                            <div className="text-center p-5">Loading organizations...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : organizations.length === 0 ? (
                            <div className="text-center p-5">No organizations found.</div>
                        ) : (
                            <>
                                {/* Organization Rows */}
                                {displayedOrganizations.map(org => (
                                    <OrganizationRow key={org.id} organization={org} />
                                ))}

                                {/* Load More Button - show if more orgs to display or more to fetch */}
                                {(displayCount < organizations.length ||
                                    !allOrganizationsLoaded) && (
                                    <div className="text-center mt-4 mb-4">
                                        <Button
                                            variant="primary"
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                        >
                                            {loading ? 'Loading...' : 'Load More'}
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
