import React from 'react';

jest.mock('react-bootstrap', () => ({
    Card: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-card">{children}</div>
    ),
    Body: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-card-body">{children}</div>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-card-title">{children}</div>
    ),
    Text: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-card-text">{children}</div>
    ),
    Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

import { render, screen } from '@testing-library/react';
import OrganizationCard from '../src/components/OrganizationCard';

test('renders OrganizationCard with correct title', () => {
    render(<OrganizationCard index={1} />);

    expect(screen.getByText(/Organization 1/i)).toBeInTheDocument();
});

test('renders Learn More button', () => {
    render(<OrganizationCard index={1} />);

    expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
});
