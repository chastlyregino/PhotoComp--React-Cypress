import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BellFill, PersonCircle } from 'react-bootstrap-icons';

import Sidebar from '../../components/bars/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';

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
            <NavButton to="/register" variant="outline-light" className="mx-2 top-bar-element">
                Register
            </NavButton>
            <NavButton to="/login" variant="outline-light" className="top-bar-element">
                Login
            </NavButton>
            <BellFill className="text-light m-2 top-bar-element" size={24} />
            <PersonCircle className="text-light m-2 top-bar-element" size={24} />
        </>
    );

    return (
        <>
            <Row className="g-0">
                <Col md="auto">
                    <Sidebar />
                </Col>
                <Col>
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
