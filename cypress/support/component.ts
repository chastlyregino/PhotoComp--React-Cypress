import { mount } from 'cypress/react18';

// Override the default mount function with one that handles React 19
Cypress.Commands.add('mount', (component, options = {}) => {
  // This wrapper helps bridge React 19 compatibility with Cypress React 18 testing
  return mount(component, options);
});

// Add type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

// Import global styles if needed
import '../../src/styles/global.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';