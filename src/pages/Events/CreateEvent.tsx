import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import * as icon from 'react-bootstrap-icons';
import { createEvent } from '../../context/OrgService';

// Import components
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import { NavLink } from 'react-router-dom';

interface EventData {
    title: string;
    description: string;
    date: string;
}

const CreateEvent: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user, token } = useContext(AuthContext);
    const [eventData, setEventData] = useState<EventData>({
        title: '',
        description: '',
        date: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventData({
            ...eventData,
            title: e.target.value,
        });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEventData({
            ...eventData,
            description: e.target.value,
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEventData({
            ...eventData,
            date: e.target.value,
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Form validation
        if (!eventData.title.trim()) {
            setError('Event title is required');
            return;
        }

        if (!eventData.description.trim()) {
            setError('Event description is required');
            return;
        }

        if (!eventData.date) {
            setError('Event date is required');
            return;
        }

        if (!id) {
            setError('Organization ID is missing');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Make API call to create event
            const response = await createEvent(id, eventData);

            console.log('Event created successfully:', response);
            setSuccess('Event created successfully!');

            // Redirect back to events page after a short delay
            setTimeout(() => {
                navigate(`/organizations/${id}/events`);
            }, 1500);
        } catch (error: any) {
            console.error('Error creating event:', error);

            // Handle specific error messages from the API
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to create event. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
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
                    <div className="create-event-page bg-dark text-light min-vh-100">
                        {/* Main Content */}
                        <Container fluid className="px-4 pt-4">
                            <Row className="justify-content-center">
                                <Col xs={12} md={8} lg={6}>
                                    <h1
                                        className="text-center mb-5"
                                        style={{ fontFamily: 'Michroma, sans-serif' }}
                                    >
                                        Events
                                    </h1>

                                    <div className="text-center mb-5">
                                        <h2
                                            className="fs-1"
                                            style={{ fontFamily: 'Michroma, sans-serif' }}
                                        >
                                            Create a New Event
                                        </h2>
                                    </div>

                                    {error && (
                                        <Alert variant="danger" className="my-3">
                                            {error}
                                        </Alert>
                                    )}

                                    {success && (
                                        <Alert variant="success" className="my-3">
                                            {success}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-4" controlId="eventTitle">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Event Title
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter event title"
                                                value={eventData.title}
                                                onChange={handleTitleChange}
                                                className="bg-white border-secondary py-3"
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="eventDescription">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Event Description
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                placeholder="Enter event description"
                                                value={eventData.description}
                                                onChange={handleDescriptionChange}
                                                className="bg-white border-secondary py-3"
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="eventDate">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Event Date
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={eventData.date}
                                                onChange={handleDateChange}
                                                className="bg-white border-secondary py-3"
                                                required
                                            />
                                        </Form.Group>

                                        <div
                                            className="position-relative mt-5 pt-5"
                                            style={{ height: '250px' }}
                                        >
                                            <div
                                                className="position-absolute"
                                                style={{ left: '-200px', top: '200px' }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        navigate(`/organizations/${id}/events`)
                                                    }
                                                    disabled={isSubmitting}
                                                    className="py-2 px-4"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>

                                            <div
                                                className="position-absolute"
                                                style={{ right: '-200px', top: '200px' }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="py-2 px-4"
                                                >
                                                    {isSubmitting ? 'Creating...' : 'Create Event'}
                                                </Button>
                                            </div>
                                        </div>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default CreateEvent;
