import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <Navbar
            collapseOnSelect
            data-bs-theme="dark"
            bg="dark"
            variant="dark"
            className="flex-column"
            style={{ width: '200px', height: '100vh' }}
        >
            <Navbar.Brand className="mx-auto">
                <img
                    src="https://see.fontimg.com/api/rf5/DA20/N2ZmZmEyODZjOTU1NGNhZThkNjc3ZWMxZTc0NzM0NWIub3Rm/UGhvdG9Db21w/capsulexpromediumuc.png?r=fs&h=118&w=2000&fg=F8F8F8&bg=000000&tb=1&s=59"
                    width="175"
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="flex-column">
                    <Nav.Link as={Link} to="/">
                        <icon.HouseDoor /> Home
                    </Nav.Link>
                    <Nav.Link as={Link} to="/organizations">
                        <icon.Grid3x3Gap /> Organizations
                    </Nav.Link>
                    <Nav.Link as={Link} to="/:id/events">
                        <icon.Window /> Events
                    </Nav.Link>
                    <Nav.Link as={Link} to="/:id/events/:eid">
                        <icon.Images /> Photos
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Sidebar;
