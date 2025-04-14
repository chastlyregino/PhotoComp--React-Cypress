import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import AccountSettings from './AccountSettings';
import { renderWithRouter } from '../../utils/test-utils';

// Mock user for AuthContext
const mockUser = {
  id: '123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user'
};

// Mock AuthContext with user data
const mockAuthContext = {
  user: mockUser,
  token: 'test-token',
  setUser: jest.fn(),
  setToken: jest.fn(),
  logout: jest.fn()
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AccountSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders account information correctly', () => {
    renderWithRouter(<AccountSettings />, { authContext: mockAuthContext });
    
    expect(screen.getByText(/Account Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();
    
    // Check user info is displayed
    expect(screen.getByText(/Account name: Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Email: test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Type: user/i)).toBeInTheDocument();
  });

  test('renders password change form', () => {
    renderWithRouter(<AccountSettings />, { authContext: mockAuthContext });
    
    expect(screen.getByLabelText(/Current Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password:/i)).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  test('validates password change form', async () => {
    renderWithRouter(<AccountSettings />, { authContext: mockAuthContext });
    
    // Submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Current password is required/i)).toBeInTheDocument();
    });
    
    // Fill current password but leave new passwords empty
    fireEvent.change(screen.getByLabelText(/Current Password:/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    
    // Fill non-matching passwords
    fireEvent.change(screen.getByLabelText(/New Password:/i), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.change(screen.getByLabelText(/Confirm Password:/i), {
      target: { value: 'differentpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/New passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('validates delete account confirmation', async () => {
    renderWithRouter(<AccountSettings />, { authContext: mockAuthContext });
    
    const deleteButton = screen.getByRole('button', { name: /Delete Account/i });
    expect(deleteButton).toBeDisabled();
    
    // Type incorrect confirmation
    fireEvent.change(screen.getByLabelText(/Type "Delete" to confirm:/i), {
      target: { value: 'delete' } // lowercase, shouldn't work
    });
    
    expect(deleteButton).toBeDisabled();
    
    // Type correct confirmation
    fireEvent.change(screen.getByLabelText(/Type "Delete" to confirm:/i), {
      target: { value: 'Delete' }
    });
    
    expect(deleteButton).not.toBeDisabled();
    
    // Click delete button
    fireEvent.click(deleteButton);
    
    // Check if logout and navigate are called
    expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('cancel button resets form fields', () => {
    renderWithRouter(<AccountSettings />, { authContext: mockAuthContext });
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/Current Password:/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/New Password:/i), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.change(screen.getByLabelText(/Confirm Password:/i), {
      target: { value: 'newpassword123' }
    });
    
    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Check if fields are cleared
    expect(screen.getByLabelText(/Current Password:/i)).toHaveValue('');
    expect(screen.getByLabelText(/New Password:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Confirm Password:/i)).toHaveValue('');
  });
});