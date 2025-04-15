
import { BrowserRouter } from 'react-router-dom';


// Mock the AuthService module
const mockChangePassword = cy.stub().as('changePasswordStub');
const mockDeleteAccount = cy.stub().as('deleteAccountStub');

describe('AccountSettings Component', () => {
  // Mock user for AuthContext
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  };

  // Mock AuthContext value
  const mockAuthContext = {
    user: mockUser,
    token: 'test-token',
    setUser: cy.stub().as('setUserStub'),
    setToken: cy.stub().as('setTokenStub'),
    logout: cy.stub().as('logoutStub')
  };

  beforeEach(() => {
    // Reset stubs
    mockChangePassword.reset();
    mockDeleteAccount.reset();
    mockAuthContext.logout.reset();

    // Create a mock module for AuthService
    cy.stub(window, 'require')
      .withArgs('../../src/context/AuthService')
      .returns({
        changePassword: mockChangePassword,
        deleteAccount: mockDeleteAccount
      });

    // Mount the component with mocked context
    mount(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <AccountSettings />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  });

  it('renders account information correctly', () => {
    cy.contains('Account Settings').should('be.visible');
    cy.contains('Personal Information').should('be.visible');
    cy.contains(`Account name: ${mockUser.firstName} ${mockUser.lastName}`).should('be.visible');
    cy.contains(`Account Email: ${mockUser.email}`).should('be.visible');
    cy.contains(`Account Type: ${mockUser.role}`).should('be.visible');
  });

  it('validates password form correctly', () => {
    // Try submitting with empty current password
    cy.contains('Save Changes').click();
    cy.contains('Current password is required').should('be.visible');
    
    // Fill current password but leave new password empty
    cy.get('#currentPassword').type('password123');
    cy.contains('Save Changes').click();
    cy.contains('New password is required').should('be.visible');
    
    // Fill new password but with mismatched confirmation
    cy.get('#newPassword').type('newpassword123');
    cy.get('#confirmPassword').type('differentpassword');
    cy.contains('Save Changes').click();
    cy.contains('New passwords do not match').should('be.visible');
  });

  it('submits password change successfully', () => {
    // Set up the stub to resolve
    mockChangePassword.resolves({ data: { status: 'success' } });
    
    // Fill form with valid data
    cy.get('#currentPassword').type('password123');
    cy.get('#newPassword').type('newpassword123');
    cy.get('#confirmPassword').type('newpassword123');
    
    // Submit the form
    cy.contains('Save Changes').click();
    
    // Verify stub was called with correct parameters
    cy.get('@changePasswordStub').should('have.been.calledWith', 'password123', 'newpassword123');
    
    // Check success message appears
    cy.contains('Password successfully updated').should('be.visible');
    
    // Check form is reset
    cy.get('#currentPassword').should('have.value', '');
    cy.get('#newPassword').should('have.value', '');
    cy.get('#confirmPassword').should('have.value', '');
  });

  it('handles password change error', () => {
    // Set up the stub to reject
    mockChangePassword.rejects({
      response: { data: { message: 'Current password is incorrect' } }
    });
    
    // Fill form with valid data
    cy.get('#currentPassword').type('wrongpassword');
    cy.get('#newPassword').type('newpassword123');
    cy.get('#confirmPassword').type('newpassword123');
    
    // Submit the form
    cy.contains('Save Changes').click();
    
    // Verify stub was called
    cy.get('@changePasswordStub').should('have.been.calledWith', 'wrongpassword', 'newpassword123');
    
    // Check error message appears
    cy.contains('Current password is incorrect').should('be.visible');
  });

  it('resets form on cancel', () => {
    // Fill form fields
    cy.get('#currentPassword').type('password123');
    cy.get('#newPassword').type('newpassword123');
    cy.get('#confirmPassword').type('newpassword123');
    
    // Click cancel
    cy.contains('Cancel').click();
    
    // Check fields are cleared
    cy.get('#currentPassword').should('have.value', '');
    cy.get('#newPassword').should('have.value', '');
    cy.get('#confirmPassword').should('have.value', '');
  });

  it('validates delete account confirmation', () => {
    // Delete button should be disabled initially
    cy.contains('Delete Account').should('be.disabled');
    
    // Type incorrect confirmation
    cy.get('#deleteConfirmation').type('delete');
    cy.contains('Delete Account').should('be.disabled');
    
    // Type correct confirmation
    cy.get('#deleteConfirmation').clear().type('Delete');
    cy.contains('Delete Account').should('not.be.disabled');
  });

  it('processes account deletion successfully', () => {
    // Set up the stub to resolve
    mockDeleteAccount.resolves({ data: { status: 'success' } });
    
    // Type correct confirmation
    cy.get('#deleteConfirmation').type('Delete');
    
    // Click delete button
    cy.contains('Delete Account').click();
    
    // Verify stub was called with correct parameters
    cy.get('@deleteAccountStub').should('have.been.calledWith', '123');
    
    // Check logout was called
    cy.get('@logoutStub').should('have.been.called');
  });

  it('handles account deletion error', () => {
    // Set up the stub to reject
    mockDeleteAccount.rejects({
      response: { data: { message: 'Failed to delete account' } }
    });
    
    // Type correct confirmation
    cy.get('#deleteConfirmation').type('Delete');
    
    // Click delete button
    cy.contains('Delete Account').click();
    
    // Verify stub was called
    cy.get('@deleteAccountStub').should('have.been.called');
    
    // Check error message appears
    cy.contains('Failed to delete account').should('be.visible');
    
    // Check logout was not called
    cy.get('@logoutStub').should('not.have.been.called');
  });

  it('navigates back to home when back button is clicked', () => {
    cy.contains('Back to Home').click();
    // Navigation would normally be tested in E2E tests
    // Here we can just verify the button exists and is clickable
  });
});