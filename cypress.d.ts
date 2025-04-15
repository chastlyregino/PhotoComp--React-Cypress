import { mount } from 'cypress/react18';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mount React component with React 19 compatibility
       */
      mount: typeof mount;
      
      /**
       * Login programmatically by setting token and user in localStorage
       */
      login(email: string, password: string): Chainable<Element>;
      
      /**
       * Mock authentication by setting a predefined user and token
       */
      mockAuth(): Chainable<Element>;

      /**
       * Fill password change form with specified values
       */
      fillPasswordForm(currentPassword: string, newPassword: string, confirmPassword: string): Chainable<null>;
      
      /**
       * Set up mock user in the auth context
       */
      setupMockUser(overrides?: Partial<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      }>): Chainable<Window>;
      
      /**
       * Mock the password change API response
       */
      mockPasswordChange(options: { 
        success: boolean; 
        errorMessage?: string;
        statusCode?: number;
      }): Chainable<null>;
      
      /**
       * Mock the account deletion API response
       */
      mockAccountDeletion(options: { 
        success: boolean; 
        errorMessage?: string;
        statusCode?: number;
      }): Chainable<null>;
    }
  }
}