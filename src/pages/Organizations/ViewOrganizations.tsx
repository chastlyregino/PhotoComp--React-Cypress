import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import { NavLink } from 'react-router-dom';

const Organizations: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

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
                <NavButton to="/organizations/create" className="mx-2 top-bar-element custom-create-button">
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

    return (
        <>
            <Row className="g-0">
                <Col md="auto">
                    <Sidebar />
                </Col>
                <Col style={{ flex: 1, marginLeft: '200px' }}>
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />
                    <div className="p-3 bg-dark text-white">
                        <h1 className="mb-4">Organizations</h1>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Organizations;
