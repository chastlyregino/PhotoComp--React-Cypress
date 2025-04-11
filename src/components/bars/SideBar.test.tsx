// Sidebar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Only mock the image import
jest.mock('../../assets/PhotoCompLogo.png', () => 'mocked-logo-path');

// Mock react-bootstrap-icons
jest.mock('react-bootstrap-icons', () => ({
  HouseDoor: () => <div data-testid="icon-house">HouseDoorIcon</div>,
  Grid3x3Gap: () => <div data-testid="icon-grid">Grid3x3GapIcon</div>,
  Window: () => <div data-testid="icon-window">WindowIcon</div>,
  Images: () => <div data-testid="icon-images">ImagesIcon</div>
}));

// Import the component AFTER setting up the mocks
import Sidebar from './SideBar';

describe('Sidebar Component', () => {
  const renderSidebar = () => {
    return render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  };

  test('renders without crashing', () => {
    renderSidebar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('displays the logo with correct src', () => {
    renderSidebar();
    const logoElement = screen.getByAltText('Logo');
    expect(logoElement).toBeInTheDocument();
    expect(logoElement).toHaveAttribute('src', 'mocked-logo-path');
  });

  test('contains the required navigation links', () => {
    renderSidebar();
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
  });

  test('renders all icons', () => {
    renderSidebar();
    
    expect(screen.getByTestId('icon-house')).toBeInTheDocument();
    expect(screen.getByTestId('icon-grid')).toBeInTheDocument();
    expect(screen.getByTestId('icon-window')).toBeInTheDocument();
    expect(screen.getByTestId('icon-images')).toBeInTheDocument();
  });

  test('has correct link destinations', () => {
    renderSidebar();
    
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/organizations');
    expect(links[2]).toHaveAttribute('href', '/:id/events');
    expect(links[3]).toHaveAttribute('href', '/:id/events/:eid');
  });

  test('applies correct CSS classes to navbar', () => {
    renderSidebar();
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('flex-column');
    expect(navbar).toHaveClass('sidebar');
    expect(navbar).toHaveClass('bg-dark');
  });

  test('applies correct CSS classes to nav links', () => {
    renderSidebar();
    
    const navLinks = screen.getAllByRole('link');
    navLinks.forEach(link => {
      expect(link).toHaveClass('nav-link');
      expect(link).toHaveClass('d-flex');
      expect(link).toHaveClass('align-items-center');
      expect(link).toHaveClass('gap-2');
      expect(link).toHaveClass('sidebar-link');
    });
  });

  test('does not apply active class to links by default', () => {
    renderSidebar();
    
    const navLinks = screen.getAllByRole('link');
    navLinks.forEach(link => {
      expect(link).not.toHaveClass('active');
    });
  });
});