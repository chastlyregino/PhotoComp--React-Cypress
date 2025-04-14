import React, { useState, useEffect, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import { getPublicOrganizations } from '../../context/OrgService';

const Organizations: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [lastKey, setLastKey] = useState<string | undefined>(undefined);
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
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {/* Create Organization should only appear when a user is logged in */}
                <NavButton
                    to="/organizations/create"
                    className="mx-2 top-bar-element custom-create-button"
                >
                    Create Organization
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
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const orgs = await getPublicOrganizations(lastKey, 9);
            console.log(orgs);
            setOrganizations(prev => [...prev, ...orgs.data.organizations]);
            setLastKey(orgs.lastEvaluatedKey ?? undefined); // update for next fetch
            setHasMore(!!orgs.lastEvaluatedKey); // if there's no more key, no more data
        } catch (err) {
            setError('Failed to fetch organizations');
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchOrganizations();
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
                                            className={`organizations-card`}
                                        />
                                    </div>
                                </Col>
                            ))}

                            {hasMore && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </button>
                                </div>
                            )}
                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Organizations;
