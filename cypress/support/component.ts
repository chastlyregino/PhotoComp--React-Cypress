import { mount } from 'cypress/react';  // Updated from cypress/react18
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import AuthContext, { AuthContextType } from '../../src/context/AuthContext';

// Import global styles
import '../../src/styles/global.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../src/styles/footer.css';
import '../../src/styles/auth.css';
import '../../src/styles/galleryCard.css';
import '../../src/styles/accountSettings.css';

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      fillPasswordForm(
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
      ): Chainable<void>;
      mountWithRouter(
        component: React.ReactNode,
        options?: any
      ): Chainable<any>;
      mountWithAuth(
        component: React.ReactNode,
        authContext?: Partial<AuthContextType>,
        options?: any
      ): Chainable<any>;
    }
  }
}

// Commands
Cypress.Commands.add('fillPasswordForm', (currentPassword, newPassword, confirmPassword) => {
  cy.get('#currentPassword').clear().type(currentPassword);
  cy.get('#newPassword').clear().type(newPassword);
  cy.get('#confirmPassword').clear().type(confirmPassword);
});

// Simple mount
Cypress.Commands.add('mount', mount);

// Mount with Router
Cypress.Commands.add('mountWithRouter', (component, options = {}) => {
  return mount(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
    options
  );
});

// Mount with Router and Auth
Cypress.Commands.add('mountWithAuth', (component, authContext = {}, options = {}) => {
  const defaultAuthContext: AuthContextType = {
    user: null,
    token: null,
    setUser: cy.stub().as('setUserStub'),
    setToken: cy.stub().as('setTokenStub'),
    logout: cy.stub().as('logoutStub'),
    ...authContext
  };
  
  return mount(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>,
    options
  );
});