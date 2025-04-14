import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import GalleryCard from './GalleryCard';
import { renderWithRouter } from '../../../utils/test-utils';

// Mock react-bootstrap Card component
jest.mock('react-bootstrap', () => ({
    Card: ({
        children,
        className,
        onClick,
        style,
    }: {
        children: React.ReactNode;
        className: string;
        onClick: () => void;
        style: React.CSSProperties;
    }) => (
        <div data-testid="mock-card" className={className} onClick={onClick} style={style}>
            {children}
        </div>
    ),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('GalleryCard Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    // Organization card tests
    test('renders organization card correctly', () => {
        const organization = {
            id: '123',
            name: 'Test Organization',
            description: 'This is a test organization',
            logoUrl: 'https://example.com/logo.jpg',
            PK: 'ORG#TESTORG',
        };

        renderWithRouter(<GalleryCard item={organization} className="organization-card" />);

        const card = screen.getByTestId('mock-card');
        expect(card).toHaveClass('organization-card');
        expect(screen.getByText('Test Organization')).toBeInTheDocument();
        expect(screen.getByText('This is a test organization')).toBeInTheDocument();
        expect(card).toHaveStyle(`background-image: url(${organization.logoUrl})`);
    });

    test('navigates to organization page when organization card is clicked', () => {
        const organization = {
            id: '123',
            name: 'Test Organization',
            PK: 'ORG#TESTORG',
        };

        renderWithRouter(<GalleryCard item={organization} className="organization-card" />);

        const card = screen.getByTestId('mock-card');
        fireEvent.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/organizations/testorg');
    });

    // Event card tests
    test('renders event card correctly', () => {
        const event = {
            id: '456',
            title: 'Test Event',
            description: 'This is a test event',
            GSI2PK: 'ORG#TESTORG',
        };

        renderWithRouter(<GalleryCard item={event} className="event" />);

        const card = screen.getByTestId('mock-card');
        expect(card).toHaveClass('event');
        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('This is a test event')).toBeInTheDocument();

        // Check organization badge is displayed
        expect(screen.getByText('TESTORG')).toBeInTheDocument();
    });

    test('navigates to event page when event card is clicked', () => {
        const event = {
            id: '456',
            title: 'Test Event',
            GSI2PK: 'ORG#TESTORG',
        };

        renderWithRouter(<GalleryCard item={event} className="event" />);

        const card = screen.getByTestId('mock-card');
        fireEvent.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/organizations/testorg/events/456');
    });

    // Photo card tests
    test('renders photo card correctly', () => {
        const photo = {
            id: '789',
            url: 'https://example.com/photo.jpg',
        };

        renderWithRouter(<GalleryCard item={photo} className="photo" />);

        const card = screen.getByTestId('mock-card');
        expect(card).toHaveClass('photo');

        // Photo card should not display title or description
        expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
        expect(screen.queryByTestId('card-description')).not.toBeInTheDocument();

        // Check background image is set correctly
        expect(card).toHaveStyle(`background-image: url(${photo.url})`);
    });

    test('truncates long descriptions', () => {
        const longDescription =
            'This is a very long description that should be truncated. It has more than 100 characters to ensure the truncation works correctly in all cases.';
        const organization = {
            id: '123',
            name: 'Test Organization',
            description: longDescription,
        };

        renderWithRouter(<GalleryCard item={organization} className="organization-card" />);

        // Expected truncated text with ellipsis
        const truncatedText = longDescription.substring(0, 97) + '...';
        expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });

    test('uses fallback image when no image URL is provided', () => {
        const organization = {
            id: '123',
            name: 'Test Organization',
        };

        renderWithRouter(<GalleryCard item={organization} className="organization-card" />);

        const card = screen.getByTestId('mock-card');
        expect(card).toHaveStyle(`background-image: url(https://picsum.photos/400/350?random=123)`);
    });
});
