/// <reference types="cypress" />
import React from 'react';
import AccountSettings from '../../src/pages/AccountSettings/AccountSettings';
// Do not import AuthService directly

// Declare global window interface extension
declare global {
  interface Window {
    mockAuthService: {
      changePassword: any;
      deleteAccount: any;
    };
  }
}

describe('AccountSettings Component', () => {
  beforeEach(() => {
    // Create mock functions that will be attached to window
    cy.window().then(win => {
      // Create the mock service with stub functions
      win.mockAuthService = {
        changePassword: cy.stub().as('changePasswordStub')
          .callsFake(() => Promise.resolve({ data: { status: 'success' } })),
        deleteAccount: cy.stub().as('deleteAccountStub')
          .callsFake(() => Promise.resolve({ data: { status: 'success' } }))
      };
      
      // Monkey patch the imports
      // @ts-ignore - Ignoring TypeScript errors for the require override
      win.require = function(path: string) {
        if (path.includes('AuthService')) {
          return win.mockAuthService;
        }
        return null;
      };
    });
  });

  // Define setup function for component tests
  const mountComponent = (options: any = {}) => {
    const {
      user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      }
    } = options;

    // Create auth context with mocked functions
    const mockAuthContext = {
      user,
      token: 'test-token',
      setUser: cy.stub().as('setUserStub'),
      setToken: cy.stub().as('setTokenStub'),
      logout: cy.stub().as('logoutStub')
    };

    // Mount the component with context
    cy.mountWithAuth(<AccountSettings />, mockAuthContext);
  };

  describe('Component Tests', () => {
    it('displays account information correctly', () => {
      mountComponent();

      cy.contains('Account Settings').should('be.visible');
      cy.contains('Personal Information').should('be.visible');
      cy.contains('Account name: Test User').should('be.visible');
      cy.contains('Account Email: test@example.com').should('be.visible');
      cy.contains('Account Type: user').should('be.visible');
    });

    it('validates password change form', () => {
      mountComponent();

      // Try submitting empty form
      cy.contains('button', 'Save Changes').click();

      cy.contains('Current password is required').should('be.visible');

      // Fill current password but leave new passwords empty
      cy.get('#currentPassword').type('password123');
      cy.contains('button', 'Save Changes').click();

      cy.contains('New password is required').should('be.visible');

      // Test password mismatch
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('differentpassword');
      cy.contains('button', 'Save Changes').click();

      cy.contains('New passwords do not match').should('be.visible');
    });

    it('successfully changes password', () => {
      mountComponent();

      // Fill form with valid data
      cy.get('#currentPassword').type('password123');
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');

      // Submit the form
      cy.contains('button', 'Save Changes').click();

      // Check success message
      cy.contains('Password successfully updated').should('be.visible');

      // Check form is reset
      cy.get('#currentPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmPassword').should('have.value', '');
    });

    it('validates delete account confirmation', () => {
      mountComponent();

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
      mountComponent();

      // Type correct confirmation
      cy.get('#deleteConfirmation').type('Delete');

      // Click delete button
      cy.contains('button', 'Delete Account').click();

      // Check if logout was called
      cy.get('@logoutStub').should('have.been.called');
    });
  });

  describe('Testing error cases', () => {
    it('handles password change API error', () => {
      // Override the stub for this specific test
      cy.window().then(win => {
        win.mockAuthService.changePassword = cy.stub().as('changePasswordStub')
          .callsFake(() => Promise.reject({
            response: { data: { message: 'Current password is incorrect' } }
          }));
      });

      mountComponent();

      // Fill form with valid data
      cy.get('#currentPassword').type('password123');
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');

      // Submit the form
      cy.contains('button', 'Save Changes').click();

      // Check error message
      cy.contains('Current password is incorrect').should('be.visible');
    });

    it('handles delete account API error', () => {
      // Override the stub for this specific test
      cy.window().then(win => {
        win.mockAuthService.deleteAccount = cy.stub().as('deleteAccountStub')
          .callsFake(() => Promise.reject({
            response: { data: { message: 'Failed to delete account' } }
          }));
      });

      mountComponent();

      // Type correct confirmation
      cy.get('#deleteConfirmation').type('Delete');

      // Click delete button
      cy.contains('button', 'Delete Account').click();

      // Check error message
      cy.contains('Failed to delete account').should('be.visible');
    });
  });
});