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
}

type CardItem = Organization | Event | Photo;

interface GalleryCardProps {
    item: CardItem;
    className: string;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, className }) => {
    const navigate = useNavigate();

    const isOrganization = className.includes('organization');
    const isEvent = className.includes('event');
    const isPhoto = className.includes('photo');

    const isOrganizationItem = (item: CardItem): item is Organization =>
        'name' in item && !('title' in item && !('organizationName' in item));
    const isEventItem = (item: CardItem): item is Event => 'title' in item;
    const isPhotoItem = (item: CardItem): item is Photo => 'url' in item;

    const getBackgroundImage = () => {
        if (isOrganizationItem(item) && item.logoUrl) {
            return item.logoUrl;
        } else if (isEventItem(item) && item.imageUrl) {
            return item.imageUrl;
        } else if (isPhotoItem(item)) {
            return item.url;
        }
        return ``;
    };

    const getTitle = () => {
        if (isOrganizationItem(item)) {
            return item.name;
        } else if (isEventItem(item)) {
            return item.title;
        } else if (isPhotoItem(item) && item.title) {
            return item.title;
        }
        return '';
    };

    const getDescription = () => {
        let description = '';

        if (isOrganizationItem(item) && item.description) {
            description = item.description;
        } else if (isEventItem(item) && item.description) {
            description = item.description;
        }

        if (description.length > 100) {
            return description.substring(0, 97) + '...';
        }

        return description;
    };

    const getOrganizationName = () => {
        if (isEventItem(item)) {
            if (item.organizationName) {
                return item.organizationName;
            } else if (item.GSI2PK) {
                const match = item.GSI2PK.match(/^ORG#(.+)$/);
                return match ? match[1] : '';
            }
        }
        return '';
    };

    const handleCardClick = () => {
        if (isOrganizationItem(item)) {
            const orgId = item.PK ? item.PK.replace('ORG#', '') : item.id;
            navigate(`/organizations/${orgId.toLowerCase()}`);
        } else if (isEventItem(item)) {
            const orgId = item.GSI2PK ? item.GSI2PK.replace('ORG#', '').toLowerCase() : '';

            navigate(`/organizations/${orgId}/events/${item.id}`);
        } else if (isPhotoItem(item)) {
            navigate(`/photos/${item.id}`);
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
