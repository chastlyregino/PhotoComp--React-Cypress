import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthContext from '../../context/AuthContext';
import Organizations from './ViewOrganizations';
import { getPublicOrganizations } from '../../context/OrgService';
import { MemoryRouter } from 'react-router-dom';

// Mock the `getPublicOrganizations` function with proper typing
jest.mock('../../context/OrgService', () => ({
    getPublicOrganizations: jest.fn() as jest.MockedFunction<typeof getPublicOrganizations>,
}));

const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
};

const mockToken = 'mockToken';

const renderComponent = (user = null, token = null) => {
    render(
        <MemoryRouter> {/* Wrap your component with MemoryRouter */}
            <AuthContext.Provider value={{ user, token, setUser: jest.fn(), setToken: jest.fn(), logout: jest.fn() }}>
                <Organizations />
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

describe('Organizations Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display loading message initially', () => {
        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({ data: { organizations: [], lastEvaluatedKey: null } });

        renderComponent(null, null);

        expect(screen.getByText('Loading organizations...')).toBeInTheDocument();
    });

    it('should display organizations when data is fetched successfully', async () => {
        const mockOrganizations = [
            { id: '1', name: 'Org 1', description: 'Description 1', logoUrl: '', PK: 'pk1', isPublic: true, createdAt: '', updatedAt: '', GSI1PK: '', GSI1SK: '', SK: '', createdBy: 'user1', type: 'type1' },
            { id: '2', name: 'Org 2', description: 'Description 2', logoUrl: '', PK: 'pk2', isPublic: true, createdAt: '', updatedAt: '', GSI1PK: '', GSI1SK: '', SK: '', createdBy: 'user2', type: 'type2' },
        ];

        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({ data: { organizations: mockOrganizations, lastEvaluatedKey: null } });

        renderComponent(null, null);

        await waitFor(() => {
            expect(screen.getByText('Org 1')).toBeInTheDocument();
            expect(screen.getByText('Org 2')).toBeInTheDocument();
        });
    });

    it('should display an error message if fetching organizations fails', async () => {
        (getPublicOrganizations as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch organizations'));

        renderComponent(null, null);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch organizations')).toBeInTheDocument();
        });
    });

    it('should handle search input and filter organizations', async () => {
        const mockOrganizations = [
            { id: '1', name: 'Org 1', description: 'Description 1', logoUrl: '', PK: 'pk1', isPublic: true, createdAt: '', updatedAt: '', GSI1PK: '', GSI1SK: '', SK: '', createdBy: 'user1', type: 'type1' },
            { id: '2', name: 'Org 2', description: 'Description 2', logoUrl: '', PK: 'pk2', isPublic: true, createdAt: '', updatedAt: '', GSI1PK: '', GSI1SK: '', SK: '', createdBy: 'user2', type: 'type2' },
        ];

        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({ data: { organizations: mockOrganizations, lastEvaluatedKey: null } });

        renderComponent(null, null);

        // Wait for organizations to be rendered
        await waitFor(() => {
            expect(screen.getByText('Org 1')).toBeInTheDocument();
            expect(screen.getByText('Org 2')).toBeInTheDocument();
        });

        // Simulate a search
        fireEvent.change(screen.getByPlaceholderText('Search organizations...'), { target: { value: 'Org 1' } });

        // Ensure the filtered organizations are shown
        expect(screen.getByText('Org 1')).toBeInTheDocument();
        expect(screen.queryByText('Org 2')).not.toBeInTheDocument();
    });

    it('should show a message if no organizations are available', async () => {
        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({ data: { organizations: [], lastEvaluatedKey: null } });

        renderComponent(null, null);

        await waitFor(() => {
            expect(screen.getByText('No organizations available.')).toBeInTheDocument();
        });
    });

    it('should display the create organization button if logged in', async () => {
        const mockOrganizations = [
            { id: '1', name: 'Org 1', description: 'Description 1', logoUrl: '', PK: 'pk1', isPublic: true, createdAt: '', updatedAt: '', GSI1PK: '', GSI1SK: '', SK: '', createdBy: 'user1', type: 'type1' },
        ];

        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({ data: { organizations: mockOrganizations, lastEvaluatedKey: null } });

        renderComponent(mockUser, mockToken);

        await waitFor(() => {
            expect(screen.getByText('Create Your First Organization')).toBeInTheDocument();
        });
    });
});
