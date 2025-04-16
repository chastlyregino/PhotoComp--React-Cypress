import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import GalleryCard from '../cards/galleryCard/GalleryCard';
import { Organization, Event, getPublicOrganizationEvents } from '../../context/OrgService';

interface OrganizationRowProps {
    organization: Organization;
}

const OrganizationRow: React.FC<OrganizationRowProps> = ({ organization }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [displayedEvents, setDisplayedEvents] = useState<number>(3);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<boolean>(false);

    const orgId = organization.PK.split('#')[1];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await getPublicOrganizationEvents(orgId);
                setEvents(response.data.events);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching events for ${organization.name}:`, err);
                setError(`Currently no events for ${organization.name}`);
                setLoading(false);
            }
        };
        fetchEvents();
    }, [organization, orgId]);

    const handleSeeMore = () => {
        setExpandedRow(true);
        setDisplayedEvents(events.length);
    };

    const handleSeeAll = () => {
        navigate(`/organizations/${orgId.toLowerCase()}`);
    };

    const eventsToDisplay = events.slice(0, displayedEvents);

    return (
        <div className="organization-row mb-4">
            <div
                className={`row-container ${expandedRow ? 'expanded' : ''}`}
                style={{
                    overflowX: 'auto',
                    display: 'flex',
                    gap: '15px',
                    paddingBottom: '10px',
                    whiteSpace: 'nowrap',
                    scrollbarWidth: 'thin',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {/* Organization Card */}
                <div style={{ minWidth: '350px', flexShrink: 0, display: 'inline-block' }}>
                    <GalleryCard item={organization} className="organization-card" orgName={organization.name} />
                </div>

                {/* Event Cards */}
                {loading ? (
                    <div>Loading events...</div>
                ) : error ? (
                    <div className="text-danger">{error}</div>
                ) : (
                    <>
                        {eventsToDisplay.map(event => (
                            <div
                                key={event.id}
                                style={{
                                    minWidth: '350px',
                                    flexShrink: 0,
                                    display: 'inline-block',
                                }}
                            >
                                <GalleryCard item={event} className="event" orgName={event.GSI2PK}/>
                            </div>
                        ))}

                        {!expandedRow && events.length > 3 && (
                            <div
                                style={{
                                    minWidth: '100px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Button className="p-1" variant="primary" onClick={handleSeeMore}>
                                    See more
                                </Button>
                            </div>
                        )}

                        {expandedRow && (
                            <div
                                style={{
                                    minWidth: '100px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Button className="p-1" variant="primary" onClick={handleSeeAll}>
                                    See All
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrganizationRow;
