import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import BackButton from './BackButton';
import { renderWithRouter } from '../../utils/test-utils';

// Mock react-bootstrap Button
jest.mock('react-bootstrap', () => ({
    Button: ({ 
        children, 
        variant, 
        className, 
        onClick 
    }: { 
        children: React.ReactNode, 
        variant: string, 
        className: string, 
        onClick: () => void 
    }) => (
        <button 
            data-testid="mock-button" 
            data-variant={variant} 
            className={className}
            onClick={onClick}
        >
            {children}
        </button>
    )
}));

// Mock react-bootstrap-icons
jest.mock('react-bootstrap-icons', () => ({
    ArrowLeft: () => <span data-testid="arrow-left-icon" />
}));

describe('BackButton Component', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        // Mock useNavigate
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockNavigate
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders with default props', () => {
        renderWithRouter(<BackButton />);
        
        const button = screen.getByTestId('mock-button');
        expect(button).toHaveTextContent('Back');
        expect(button).toHaveAttribute('data-variant', 'light');
        expect(button).toHaveClass('back-button');
        expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    test('renders with custom text', () => {
        renderWithRouter(<BackButton>Go Home</BackButton>);
        
        const button = screen.getByTestId('mock-button');
        expect(button).toHaveTextContent('Go Home');
    });

    test('applies custom class names', () => {
        renderWithRouter(<BackButton className="custom-class">Back</BackButton>);
        
        const button = screen.getByTestId('mock-button');
        expect(button).toHaveClass('custom-class');
        expect(button).toHaveClass('back-button');
    });

    test('applies custom variant', () => {
        renderWithRouter(<BackButton variant="outline-dark">Back</BackButton>);
        
        const button = screen.getByTestId('mock-button');
        expect(button).toHaveAttribute('data-variant', 'outline-dark');
    });

    test('navigates to specified route when clicked', () => {
        const { rerender } = renderWithRouter(<BackButton to="/dashboard">Back</BackButton>);
        
        const button = screen.getByTestId('mock-button');
        fireEvent.click(button);
        
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        
        // Test default route
        rerender(<BackButton>Back</BackButton>);
        fireEvent.click(button);
        
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
