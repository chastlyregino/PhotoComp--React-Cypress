import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/PhotoCompLogo.png';

const Sidebar: React.FC = () => {
    return (
        <Navbar
            collapseOnSelect
            data-bs-theme="dark"
            bg="dark"
            variant="dark"
            className="flex-column"
            style={{
                width: '200px',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000,
            }}
        >
            <Navbar.Brand className="mx-auto">
                <img src={logo} width="175" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="flex-column">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 ${isActive}`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      backgroundColor: '#71797E',
                                      color: '#ffffff',
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                                : {
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                        }
                    >
                        <icon.HouseDoor /> Home
                    </NavLink>

                    <NavLink
                        to="/organizations"
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 ${isActive}`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      backgroundColor: '#71797E',
                                      color: '#ffffff',
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                                : {
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                        }
                    >
                        <icon.Grid3x3Gap /> Organizations
                    </NavLink>

                    <NavLink
                        to="/:id/events"
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 ${isActive}`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      backgroundColor: '#71797E',
                                      color: '#ffffff',
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                                : {
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                        }
                    >
                        <icon.Window /> Events
                    </NavLink>

                    <NavLink
                        to="/:id/events/:eid"
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 ${isActive}`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      backgroundColor: '#3A3838',
                                      color: '#ffffff',
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                                : {
                                      fontFamily: 'Roboto, sans-serif',
                                      fontSize: '20px',
                                      textDecoration: 'none',
                                  }
                        }
                    >
                        <icon.Images /> Photos
                    </NavLink>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Sidebar;
