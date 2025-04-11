import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import BackButton from './BackButton';
import { renderWithRouter } from '../../utils/test-utils';

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

jest.mock('react-bootstrap-icons', () => ({
    ArrowLeft: () => <span data-testid="arrow-left-icon" />
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('BackButton Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    test('renders with default props', () => {
        renderWithRouter(<BackButton />);
        
        const button = screen.getByTestId('mock-button');
        expect(button).toHaveTextContent('Back');
        expect(button).toHaveAttribute('data-variant', 'primary');
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
        const { rerender } = renderWithRouter(<BackButton to="/dashboard">Back to dashboard</BackButton>);
        
        const button = screen.getByTestId('mock-button');
        fireEvent.click(button);
        
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        
        mockNavigate.mockClear(); 
        rerender(<BackButton>Back</BackButton>);
        
        const defaultButton = screen.getByTestId('mock-button');
        fireEvent.click(defaultButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
