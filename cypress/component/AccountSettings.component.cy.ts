import React from 'react';
import { mount } from 'cypress/react18';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthContext from '../../src/context/AuthContext';
import AccountSettings from '../../src/pages/AccountSettings/AccountSettings';

describe('AccountSettings Component', () => {
  // Common setup for mocking services
  const setupComponent = (options = {}) => {
    const {
      user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      },
      mockChangePasswordFn = cy.stub().as('changePasswordStub'),
      mockDeleteAccountFn = cy.stub().as('deleteAccountStub'),
      mockLogoutFn = cy.stub().as('logoutStub'),
      mockNavigateFn = cy.stub().as('navigateStub')
    } = options;

    // Create auth context with mocked functions
    const mockAuthContext = {
      user,
      token: 'test-token',
      setUser: cy.stub().as('setUserStub'),
      setToken: cy.stub().as('setTokenStub'),
      logout: mockLogoutFn
    };

    // Mock the service functions
    cy.stub(window, 'require')
      .withArgs('../../src/context/AuthService')
      .returns({
        changePassword: mockChangePasswordFn,
        deleteAccount: mockDeleteAccountFn
      });

    // Mock the useNavigate hook
    cy.stub(window, 'require')
      .withArgs('react-router-dom')
      .returns({
        ...window.require('react-router-dom'),
        useNavigate: () => mockNavigateFn
      });

    // Mount the component with mocked context
    mount(
      <Router>
        <AuthContext.Provider value={mockAuthContext}>
          <AccountSettings />
        </AuthContext.Provider>
      </Router>
    );
    
    return {
      user,
      mockAuthContext,
      mockChangePasswordFn,
      mockDeleteAccountFn,
      mockLogoutFn,
      mockNavigateFn
    };
  };

  describe('Rendering', () => {
    it('renders account information correctly', () => {
      const { user } = setupComponent();
      
      cy.contains('Account Settings').should('be.visible');
      cy.contains('Personal Information').should('be.visible');
      
      // Check user info is displayed
      cy.contains(`Account name: ${user.firstName} ${user.lastName}`).should('be.visible');
      cy.contains(`Account Email: ${user.email}`).should('be.visible');
      cy.contains(`Account Type: ${user.role}`).should('be.visible');
    });

    it('renders password change form', () => {
      setupComponent();
      
      cy.get('#currentPassword').should('be.visible');
      cy.get('#newPassword').should('be.visible');
      cy.get('#confirmPassword').should('be.visible');
      
      cy.contains('button', 'Cancel').should('be.visible');
      cy.contains('button', 'Save Changes').should('be.visible');
    });
  });

  describe('Password Change', () => {
    it('validates form fields', () => {
      setupComponent();
      
      // Empty fields validation
      cy.contains('button', 'Save Changes').click();
      cy.contains('Current password is required').should('be.visible');
      
      // Fill current password but leave new passwords empty
      cy.get('#currentPassword').type('password123');
      cy.contains('button', 'Save Changes').click();
      cy.contains('New password is required').should('be.visible');
      
      // Fill new password but with mismatched confirmation
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('differentpassword');
      cy.contains('button', 'Save Changes').click();
      cy.contains('New passwords do not match').should('be.visible');
    });

    it('submits password change successfully', () => {
      const { mockChangePasswordFn } = setupComponent();
      
      mockChangePasswordFn.resolves({ data: { status: 'success' } });
      
      // Fill form with valid data
      cy.fillPasswordForm('password123', 'newpassword123', 'newpassword123');
      
      // Submit the form
      cy.contains('button', 'Save Changes').click();
      
      // Verify stub was called with correct parameters
      cy.get('@changePasswordStub').should('have.been.calledWith', 'password123', 'newpassword123');
      
      // Check success message appears
      cy.contains('Password successfully updated').should('be.visible');
      
      // Check form is reset
      cy.get('#currentPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmPassword').should('have.value', '');
    });

    it('handles password change API error', () => {
      const { mockChangePasswordFn } = setupComponent();
      
      mockChangePasswordFn.rejects({
        response: { data: { message: 'Current password is incorrect' } }
      });
      
      // Fill form with valid data
      cy.get('#currentPassword').clear().type('wrongpassword');
      cy.get('#newPassword').clear().type('newpassword123');
      cy.get('#confirmPassword').clear().type('newpassword123');
      
      // Submit the form
      cy.contains('button', 'Save Changes').click();
      
      // Verify stub was called
      cy.get('@changePasswordStub').should('have.been.calledWith', 'wrongpassword', 'newpassword123');
      
      // Check error message appears
      cy.contains('Current password is incorrect').should('be.visible');
    });

    it('resets form on cancel', () => {
      setupComponent();
      
      // Fill form fields
      cy.fillPasswordForm('password123', 'newpassword123', 'newpassword123');
      
      // Click cancel
      cy.contains('button', 'Cancel').click();
      
      // Check fields are cleared
      cy.get('#currentPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmPassword').should('have.value', '');
    });
  });

  describe('Account Deletion', () => {
    it('validates delete account confirmation', () => {
      setupComponent();
      
      // Delete button should be disabled initially
      cy.contains('button', 'Delete Account').should('be.disabled');
      
      // Type incorrect confirmation
      cy.get('#deleteConfirmation').type('delete');
      cy.contains('button', 'Delete Account').should('be.disabled');
      
      // Type correct confirmation
      cy.get('#deleteConfirmation').clear().type('Delete');
      cy.contains('button', 'Delete Account').should('not.be.disabled');
    });

    it('successfully deletes account', () => {
      const { mockDeleteAccountFn, mockLogoutFn, mockNavigateFn } = setupComponent();
      
      mockDeleteAccountFn.resolves({ data: { status: 'success' } });
      
      // Type correct confirmation
      cy.get('#deleteConfirmation').type('Delete');
      
      // Click delete button
      cy.contains('button', 'Delete Account').click();
      
      // Verify stub was called with correct parameters
      cy.get('@deleteAccountStub').should('have.been.calledWith', '123');
      
      // Check logout was called
      cy.get('@logoutStub').should('have.been.called');
      
      // Check navigation happened
      cy.get('@navigateStub').should('have.been.calledWith', '/login');
    });

    it('handles account deletion API error', () => {
      const { mockDeleteAccountFn, mockLogoutFn, mockNavigateFn } = setupComponent();
      
      mockDeleteAccountFn.rejects({
        response: { data: { message: 'Failed to delete account' } }
      });
      
      // Type correct confirmation
      cy.get('#deleteConfirmation').type('Delete');
      
      // Click delete button
      cy.contains('button', 'Delete Account').click();
      
      // Verify stub was called
      cy.get('@deleteAccountStub').should('have.been.called');
      
      // Check error message appears
      cy.contains('Failed to delete account').should('be.visible');
      
      // Check logout was not called
      cy.get('@logoutStub').should('not.have.been.called');
      
      // Check no navigation happened
      cy.get('@navigateStub').should('not.have.been.called');
    });
  });

  describe('Navigation', () => {
    it('navigates back to home when back button is clicked', () => {
      const { mockNavigateFn } = setupComponent();
      
      cy.contains('Back to Home').click();
      
      // Check navigation was called
      cy.get('@navigateStub').should('have.been.calledWith', '/');
    });
  });
});