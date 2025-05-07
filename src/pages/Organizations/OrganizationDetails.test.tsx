import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrganizationDetails from './OrganizationDetails';
import AuthContext, { User } from '../../context/AuthContext';
import * as OrgService from '../../context/OrgService';
import * as AuthService from '../../context/AuthService';

jest.mock('../../context/OrgService');
jest.mock('../../context/AuthService');

const mockGetPublicOrganizations = OrgService.getPublicOrganizations as jest.Mock;
const mockUpdateOrganization = OrgService.updateOrganization as jest.Mock;
const mockIsMemberOfOrg = AuthService.isMemberOfOrg as jest.Mock;

const mockOrganization = {
  id: '1',
  name: 'Test Org',
  description: 'Test Description',
  contactEmail: 'contact@test.org',
  website: 'https://test.org',
  logoUrl: 'https://logo.url/logo.png',
};

const mockNavigate = jest.fn();
const mockParams = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
}));

const renderWithRouter = () => {
  const mockUser: User = {
    id: 'user1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  };

  return render(
    <MemoryRouter initialEntries={['/organizations/1/details']}>
      <AuthContext.Provider
        value={{
          user: mockUser,
          token: 'mockToken',
          setUser: jest.fn(),
          setToken: jest.fn(),
          logout: jest.fn(),
        }}
      >
        <Routes>
          <Route path="/organizations/:id/details" element={<OrganizationDetails />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('OrganizationDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockGetPublicOrganizations.mockResolvedValue({
          data: {
            organizations: [mockOrganization],
          },
        });
      
        mockIsMemberOfOrg.mockResolvedValue({
          data: {
            data: {
              membership: {
                role: 'ADMIN',
              },
            },
          },
        });
      
        mockUpdateOrganization.mockResolvedValue({});
      });

    // it('renders organization details for admin', async () => {
    //     renderWithRouter('admin');
    
    //     // Wait for the page to render and for the text to appear
    //     await waitFor(() => {
    //         const organizationDetailsText = screen.getByText(/Organization Details/i);
    //         expect(organizationDetailsText).toBeInTheDocument();
    //     });

    //     // Ensure organization name and description are rendered correctly
    //     await waitFor(() => {
    //         const organizationNameInput = screen.getByDisplayValue('Test Org');
    //         const descriptionInput = screen.getByDisplayValue('Test Description');
    //         expect(organizationNameInput).toBeInTheDocument();
    //         expect(descriptionInput).toBeInTheDocument();
    //     });

    //     // Ensure the Update button is present
    //     const updateButton = screen.getByRole('button', { name: /Update Organization/i });
    //     expect(updateButton).toBeInTheDocument();
    // });
    
    // it('renders readonly fields for non-admin user', async () => {
    //     mockIsMemberOfOrg.mockResolvedValue({
    //     data: {
    //         data: {
    //         membership: {
    //             role: 'MEMBER',
    //         },
    //         },
    //     },
    //     });

    //     renderWithRouter('member');

    //     await waitFor(() => {
    //     expect(screen.getByText(/Organization Details/i)).toBeInTheDocument();
    //     });

    //     expect(screen.getByDisplayValue('Test Description')).toHaveAttribute('readonly');
    //     expect(screen.queryByRole('button', { name: /Update Organization/i })).not.toBeInTheDocument();
    // });

    it('shows error when organization not found', async () => {
        mockGetPublicOrganizations.mockResolvedValueOnce({
        data: { organizations: [] },
        });

        renderWithRouter();

        await waitFor(() => {
        expect(screen.getByText(/Organization not found/i)).toBeInTheDocument();
        });
    });

});

describe('OrganizationDetails directly rendering router', () => {
    beforeEach(() => {
        jest.clearAllMocks();
      
        mockGetPublicOrganizations.mockResolvedValue({
          data: {
            organizations: [mockOrganization],
          },
        });
      
        mockIsMemberOfOrg.mockResolvedValue({
          data: {
            data: {
              membership: {
                role: 'ADMIN',
              },
            },
          },
        });
      
        mockUpdateOrganization.mockResolvedValue({});

        //renderWithRouter('ADMIN');
    });
    
    // it('renders organization details page correctly for admin', async () => {
    //     await waitFor(() => {
    //         expect(screen.getByText(/Organization Details/i)).toBeInTheDocument();
    //         expect(screen.getByText(/Organization Name/i)).toBeInTheDocument();
    //         expect(screen.getByText(/Description/i)).toBeInTheDocument();
    //         expect(screen.getByText(/Contact Email/i)).toBeInTheDocument();
    //         expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    //     });
    // });

    it('allows admin to update organization details', async () => {
        renderWithRouter();
      
        // Wait for fields to be populated
        await waitFor(() => {
          expect(screen.getByDisplayValue('Test Org')).toBeInTheDocument();
          expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
          expect(screen.getByDisplayValue('contact@test.org')).toBeInTheDocument();
        });
      
        // Change description and email
        fireEvent.change(screen.getByLabelText(/Description/i), {
          target: { value: 'Updated Description' },
        });
      
        fireEvent.change(screen.getByLabelText(/Contact Email/i), {
          target: { value: 'updated@email.com' },
        });
      
        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Update Organization/i }));
      
        // Wait for the update call
        await waitFor(() => {
          expect(mockUpdateOrganization).toHaveBeenCalledWith(expect.anything(), {
            ...mockOrganization,
            description: 'Updated Description',
            contactEmail: 'updated@email.com',
          });
        });
      });
      

    // it('allows updating form fields and submitting', async () => {
    //     await waitFor(() => {
    //         expect(screen.getByRole('textarea', { name: /Description/i })).toBeInTheDocument();
    //     });

    //     act(() => {
    //         fireEvent.change(screen.getByRole('textbox', { name: /Contact Email/i }), {
    //             target: { value: 'new@email.com' },
    //             });
        
    //         fireEvent.click(screen.getByRole('button', { name: /Update Organization/i }));
    //     })
        

    //     await waitFor(() => {
    //         expect(mockUpdateOrganization).toHaveBeenCalled();
    //     });
    // });

    // it('handles image upload and preview', async () => {
    //     await waitFor(() => {
    //     expect(screen.getByAltText(/Logo Preview/i)).toBeInTheDocument();
    //     });
    
    //     // Simulate a file input change
    //     const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    
    //     // Use screen.getByLabelText or screen.getByRole to find the input element
    //     const input = screen.getByLabelText(/Logo/i) as HTMLInputElement; // Cast to HTMLInputElement
    
    //     // Trigger the file selection
    //     fireEvent.change(input, { target: { files: [file] } });
    
    //     // Check that the file was correctly selected
    //     expect(input.files?.[0]).toBe(file);  // Now TypeScript won't complain about 'files'
    // });  

    // it('disables submit button while submitting', async () => {
    //     await waitFor(() => {
    //     expect(screen.getByRole('button', { name: /Update Organization/i })).toBeInTheDocument();
    //     });

    //     fireEvent.click(screen.getByRole('button', { name: /Update Organization/i }));

    //     await waitFor(() => {
    //     expect(screen.getByRole('button')).toBeDisabled();
    //     });
    // });
});

