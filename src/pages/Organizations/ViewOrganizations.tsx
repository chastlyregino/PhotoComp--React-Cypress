import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import { Organization, getPublicOrganizations } from '../../context/OrgService';
import AuthContext from '../../context/AuthContext';

const Organizations: React.FC = () => {
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const fetchedRef = useRef(false);

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
            placeholder="Search organizations..."
            className="ms-3"
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        {/* Create Organization should only appear when a user is logged in */}
                        <NavButton
                            to="/organizations/create"
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Create Organization
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

    const fetchOrganizations = async (key: string | undefined = undefined) => {
        setLoading(true);
        try {
            const orgs = await getPublicOrganizations(key);
            if (key) {
                setOrganizations(prev => [...prev, ...orgs.data.organizations]);
            } else {
                setOrganizations(orgs.data.organizations);
            }
            setLastEvaluatedKey(orgs.lastEvaluatedKey); // update for next fetch
            setHasMore(orgs.lastEvaluatedKey !== null); // if there's no more key, no more data
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch organizations');
        }
    };

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchOrganizations();
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchOrganizations(lastEvaluatedKey ?? undefined);
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
                        <Row>
                            <h1 className="mb-4">Organizations</h1>
                        </Row>
                        <Row>
                            {error && <p className="text-red-500">{error}</p>}

                            {organizations.map(org => (
                                <Col>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <GalleryCard
                                            key={org.id}
                                            item={org}
                                            className={`organization-card`}
                                        />
                                    </div>
                                </Col>
                            ))}
                            <div className="text-center mt-4 mb-4">
                                {hasMore && (
                                
                                    <Button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        //className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </Button>
                                
                                )}
                            </div>
                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Organizations;
