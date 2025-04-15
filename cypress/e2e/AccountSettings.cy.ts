describe('Account Settings Page', () => {
    // Mock user data for testing
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
  
    beforeEach(() => {
      // Intercept API calls and set up mocks
      cy.intercept('PATCH', '/api/auth/password', (req) => {
        if (req.body.currentPassword === 'wrongpassword') {
          return req.reply({
            statusCode: 401,
            body: { 
              message: 'Current password is incorrect' 
            }
          });
        }
        return req.reply({
          statusCode: 200,
          body: { 
            status: 'success',
            message: 'Password updated successfully' 
          }
        });
      }).as('changePassword');
  
      cy.intercept('DELETE', '/api/auth/users/*', (req) => {
        return req.reply({
          statusCode: 200,
          body: { 
            status: 'success',
            message: 'Account deleted successfully' 
          }
        });
      }).as('deleteAccount');
  
      // Set up local storage with mock auth data
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'test-token');
        win.localStorage.setItem('user', JSON.stringify(mockUser));
      });
  
      // Visit the account settings page
      cy.visit('/account-settings');
    });
  
    it('displays user information correctly', () => {
      // Check if the page title is displayed
      cy.contains('h2', 'Account Settings').should('be.visible');
      
      // Check if personal information section is displayed
      cy.contains('h3', 'Personal Information').should('be.visible');
      
      // Check if user info is displayed correctly
      cy.contains(`Account name: ${mockUser.firstName} ${mockUser.lastName}`).should('be.visible');
      cy.contains(`Account Email: ${mockUser.email}`).should('be.visible');
      cy.contains(`Account Type: ${mockUser.role}`).should('be.visible');
    });
  
    it('validates password change form fields', () => {
      // Try submitting with empty current password
      cy.contains('button', 'Save Changes').click();
      cy.contains('Current password is required').should('be.visible');
      
      // Fill current password but leave new password empty
      cy.get('#currentPassword').type('password123');
      cy.contains('button', 'Save Changes').click();
      cy.contains('New password is required').should('be.visible');
      
      // Fill new password but with mismatched confirmation
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('differentpassword');
      cy.contains('button', 'Save Changes').click();
      cy.contains('New passwords do not match').should('be.visible');
      
      // Fill new password that's too short
      cy.get('#newPassword').clear().type('short');
      cy.get('#confirmPassword').clear().type('short');
      cy.contains('button', 'Save Changes').click();
      cy.contains('Password must be at least 8 characters long').should('be.visible');
    });
  
    it('successfully changes password', () => {
      // Fill form with valid data
      cy.get('#currentPassword').type('password123');
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');
      
      // Submit the form
      cy.contains('button', 'Save Changes').click();
      
      // Wait for the API call
      cy.wait('@changePassword');
      
      // Check for success message
      cy.contains('Password successfully updated').should('be.visible');
      
      // Check if form is reset
      cy.get('#currentPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmPassword').should('have.value', '');
    });
  
    it('handles incorrect current password', () => {
      // Fill form with wrong current password
      cy.get('#currentPassword').type('wrongpassword');
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');
      
      // Submit the form
      cy.contains('button', 'Save Changes').click();
      
      // Wait for the API call
      cy.wait('@changePassword');
      
      // Check for error message
      cy.contains('Current password is incorrect').should('be.visible');
    });
  
    it('resets form fields when cancel button is clicked', () => {
      // Fill form fields
      cy.get('#currentPassword').type('password123');
      cy.get('#newPassword').type('newpassword123');
      cy.get('#confirmPassword').type('newpassword123');
      
      // Click cancel button
      cy.contains('button', 'Cancel').click();
      
      // Check if fields are cleared
      cy.get('#currentPassword').should('have.value', '');
      cy.get('#newPassword').should('have.value', '');
      cy.get('#confirmPassword').should('have.value', '');
    });
  
    it('validates account deletion confirmation', () => {
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
      
      // Wait for the API call
      cy.wait('@deleteAccount');
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      
      // Local storage should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  
    it('handles error when deleting account', () => {
      // Intercept and mock a failure
      cy.intercept('DELETE', '/api/auth/users/*', {
        statusCode: 500,
        body: { 
          message: 'Failed to delete account' 
        }
      }).as('deleteAccountError');
      
      // Type correct confirmation
      cy.get('#deleteConfirmation').type('Delete');
      
      // Click delete button
      cy.contains('button', 'Delete Account').click();
      
      // Wait for the API call
      cy.wait('@deleteAccountError');
      
      // Check for error message
      cy.contains('Failed to delete account').should('be.visible');
      
      // Should not redirect
      cy.url().should('include', '/account-settings');
    });
  
    it('navigates back to home when back button is clicked', () => {
      // Click the back button
      cy.contains('Back to Home').click();
      
      // Should navigate to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });