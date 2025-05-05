import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Events from './ViewEvents';
import AuthContext, { User } from '../../context/AuthContext';
import * as OrgService from '../../context/OrgService';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock child components
jest.mock('../../components/bars/SideBar/SideBar', () => () => <div>MockSidebar</div>);
// jest.mock('../../components/bars/TopBar/TopBar', () => () => <div>MockTopBar</div>);
jest.mock('../../components/bars/SearchBar/SearchBar', () => () => <div>MockSearchBar</div>);
jest.mock('../../components/navButton/NavButton', () => ({ children }: { children: React.ReactNode }) => <button>{children}</button>);
jest.mock('../../components/cards/galleryCard/GalleryCard', () => ({ item }: { item: any }) => <div>{item.title}</div>);

// Mock service calls
jest.mock('../../context/OrgService');

const mockOrgs = {
  data: {
    organizations: [
      { id: 'org1', name: 'Org One' },
    ],
  },
  lastEvaluatedKey: null,
};

const mockEvents = {
  data: {
    events: [
      { id: 'event1', title: 'Event One', GSI2PK: 'Org One' },
    ],
  },
  lastEvaluatedKey: null,
};

describe('Events Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (OrgService.getPublicOrganizations as jest.Mock).mockResolvedValue(mockOrgs);
    (OrgService.getPublicOrganizationEvents as jest.Mock).mockResolvedValue(mockEvents);
  });

  const renderPage = (
    user: User | null = null,
    token: string | null = null
  ) => {
    const mockSetUser = jest.fn();
    const mockSetToken = jest.fn();
    const mockLogout = jest.fn();

    render(
      <AuthContext.Provider
        value={{
          user,
          token,
          setUser: mockSetUser,
          setToken: mockSetToken,
          logout: mockLogout,
        }}
      >
        <MemoryRouter initialEntries={['/organizations/123/events']}>
          <Routes>
            <Route path="/organizations/:id/events" element={<Events />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'viewer',
  };

  it('renders and fetches organizations and events', async () => {
    renderPage(mockUser, 'token123');

    expect(screen.getByText(/MockSidebar/)).toBeInTheDocument();
    expect(screen.getByText(/Events/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Event One/i)).toBeInTheDocument();
    });
  });

  it('shows Load More button if hasMore is true', async () => {
    (OrgService.getPublicOrganizations as jest.Mock).mockResolvedValue({
      ...mockOrgs,
      lastEvaluatedKey: 'next-key',
    });

    renderPage(mockUser, 'token123');

    await waitFor(() => {
      expect(screen.getByText(/Event One/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument();
  });

  it('displays login/register buttons if user not logged in', () => {
    renderPage(null, null);
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('displays an error if fetching organizations fails', async () => {
    (OrgService.getPublicOrganizations as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderPage(mockUser, 'token123');

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch organizations/i)).toBeInTheDocument();
    });
  });

  it('renders no event cards if organization has no events', async () => {
    (OrgService.getPublicOrganizationEvents as jest.Mock).mockResolvedValue({
      data: {
        events: [],
      },
      lastEvaluatedKey: null,
    });

    renderPage(mockUser, 'token123');

    await waitFor(() => {
      expect(screen.queryByText(/Event One/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Events/i)).toBeInTheDocument();
  });
});
