import React from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Organization {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    PK?: string;
}

interface Event {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    GSI2PK?: string;
    organizationName?: string;
}

interface Photo {
    id: string;
    url: string;
    title?: string;
    GSI2PK?: string;
}

type CardItem = Organization | Event | Photo;

interface GalleryCardProps {
    item: CardItem;
    className: string;
    orgName: string | undefined;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, className, orgName }) => {
    const navigate = useNavigate();

    const isOrganization = 'name' in item;
    const isEvent = 'title' in item;
    const isPhoto = 'url' in item;

    const getBackgroundImage = () => {
        if (isOrganization && (item as Organization).logoUrl) {
            return (item as Organization).logoUrl;
        } else if (isEvent && (item as Event).imageUrl) {
            return (item as Event).imageUrl;
        } else if (isPhoto) {
            return (item as Photo).url;
        }
        return ``;
    };

    const getTitle = () => {
        if (isOrganization) {
            return (item as Organization).name;
        } else if (isEvent) {
            return (item as Event).title;
        } else if (isPhoto && (item as Photo).title) {
            return (item as Photo).title;
        }
        return '';
    };

    const getDescription = () => {
        let description = '';

        if (isOrganization && (item as Organization).description) {
            description = (item as Organization).description || '';
        } else if (isEvent && (item as Event).description) {
            description = (item as Event).description || '';
        }

        if (description.length > 100) {
            return description.substring(0, 97) + '...';
        }

        return description;
    };

    const getOrganizationName = () => {
        if (isEvent) {
            const event = item as Event;
            if (event.organizationName) {
                return event.organizationName;
            } else if (event.GSI2PK) {
                const match = event.GSI2PK.match(/^ORG#(.+)$/);
                return match ? match[1] : '';
            }
        }
        return '';
    };

    const handleCardClick = () => {
        if (isOrganization) {
            const org = item as Organization;
            // Extract organization name from PK or use the name property
            let organizationName = org.name;
            if (org.PK) {
                const match = org.PK.match(/^ORG#(.+)$/);
                if (match) organizationName = match[1];
            }
            navigate(`/organizations/${organizationName.toLowerCase()}/events`);
        } else if (isEvent) {
            const event = item as Event;
            if (event.GSI2PK) {
                const match = event.GSI2PK.match(/^ORG#(.+)$/);
                const orgName = match ? match[1].toLowerCase() : '';
                navigate(`/organizations/${orgName}/events/${event.id}/photos`);
            }
        } else if (isPhoto) {
            const photo = item as Photo;
            if (photo.GSI2PK && orgName) {
                const eventId = photo.GSI2PK.replace('EVENT#', '');
                navigate(`/organizations/${orgName.toLowerCase()}/events/${eventId}/photos/${photo.id}`);
            }
        }
    };

    return (
        <Card
            className={`gallery-card ${className}`}
            onClick={handleCardClick}
            style={{
                width: '350px',
                height: '250px',
                backgroundImage: `url(${getBackgroundImage()})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer',
            }}
        >
            <div className="card-overlay"></div>

            {isEvent && <div className="organization-badge">{getOrganizationName()}</div>}

            {!isPhoto && (
                <div className="card-content">
                    <h5 className="card-title">{getTitle()}</h5>
                    {getDescription() && <p className="card-description">{getDescription()}</p>}
                </div>
            )}
        </Card>
    );
};

export default GalleryCard;