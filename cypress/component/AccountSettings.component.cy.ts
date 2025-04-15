/// <reference types="cypress" />
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthContext from '../../src/context/AuthContext';
import AccountSettings from '../../src/pages/AccountSettings/AccountSettings';
import * as AuthService from '../../src/context/AuthService';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    mockAuthContext?: any;
  }
}

describe('AccountSettings Component', () => {
  beforeEach(() => {
    // Stub AuthService functions
    cy.stub(AuthService, 'changePassword').as('changePasswordStub');
    cy.stub(AuthService, 'deleteAccount').as('deleteAccountStub');
  });

  // Define setup function
  const setupComponent = (options: any = {}) => {
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

    // Visit the page
    cy.visit('/account-settings', {
      onBeforeLoad(win) {
        // Stub window.localStorage
        Object.defineProperty(win, 'localStorage', {
          value: {
            getItem: cy.stub().as('getItemStub'),
            setItem: cy.stub().as('setItemStub'),
            removeItem: cy.stub().as('removeItemStub')
          }
        });

        // Mock the Auth context
        win.mockAuthContext = mockAuthContext;
      }
    });

    return {
      user,
      mockAuthContext
    };
  };

  describe('E2E Tests', () => {
    beforeEach(() => {
      // Setup mock user in localStorage
      cy.window().then(win => {
        const user = {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user'
        };
        win.localStorage.setItem('token', 'test-token');
        win.localStorage.setItem('user', JSON.stringify(user));
      });

      // Mock the API requests
      cy.intercept('PATCH', '/api/auth/password', {
        statusCode: 200,
        body: { status: 'success', message: 'Password updated successfully' }
      }).as('changePassword');

      cy.intercept('DELETE', '/api/auth/users/*', {
        statusCode: 200,
        body: { status: 'success', message: 'Account deleted successfully' }
      }).as('deleteAccount');

      // Visit the account settings page
      cy.visit('/account-settings');
    });

    it('displays user information correctly', () => {
      cy.contains('Account Settings').should('be.visible');
      cy.contains('Personal Information').should('be.visible');
      cy.contains('Account name: Test User').should('be.visible');
      cy.contains('Account Email: test@example.com').should('be.visible');
      cy.contains('Account Type: user').should('be.visible');
    });

    it('validates password change form', () => {
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
      // Fill form with valid data
      cy.get('#currentPassword').type('password123');
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');
      
      // Submit the form
      cy.contains('button', 'Save Changes').click();
      
      // Wait for API request
      cy.wait('@changePassword');
      
      // Check success message
      cy.contains('Password successfully updated').should('be.visible');
      
      // Check form is reset
      cy.get('#currentPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmPassword').should('have.value', '');
    });

    it('validates delete account confirmation', () => {
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
      // Type correct confirmation
      cy.get('#deleteConfirmation').type('Delete');
      
      // Click delete button
      cy.contains('button', 'Delete Account').click();
      
      // Wait for API request
      cy.wait('@deleteAccount');
      
      // Should redirect to login page
      cy.url().should('include', '/login');
    });
  });
});