import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BellFill, PersonCircle } from 'react-bootstrap-icons';

import Gallery from '../components/Gallery';
import Sidebar from '../components/bars/SideBar';
import TopBar from '../components/bars/TopBar/TopBar';
import SearchBar from '../components/bars/SearchBar/SearchBar';
import NavButton from '../components/navButton/NavButton';

const items = [
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
  {

    id: "NAME",
    name: "name",
    description: "Some random description",
    logoUrl: "https://picsum.photos/300/200",
    PK: "ORG#NAME"
  },
];



const Home = () => {
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
                <Col style={{ flex: 1, marginLeft: '200px' }}>
                    <TopBar 
                        searchComponent={searchComponent}
                        rightComponents={rightComponents}
                    />
                    <div className="p-3">
                        <h1 className="mb-4">Organizations</h1>
                        <Gallery items={items} />
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Home;
