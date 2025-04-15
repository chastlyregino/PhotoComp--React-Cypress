// / <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.

// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************


// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })


// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })


// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })


// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }



// Augment the Cypress namespace to include custom commands
declare global {
    namespace Cypress {
      interface Chainable {
        /**
         * Login programmatically by setting token and user in localStorage
         * @example cy.login('admin@example.com', 'password123')
         */
        login(email: string, password: string): Chainable<Element>;
        
        /**
         * Mock authentication by setting a predefined user and token
         * @example cy.mockAuth()
         */
        mockAuth(): Chainable<Element>;
      }
    }
  }
  
  // Add a custom Cypress command for login
  Cypress.Commands.add('login', (email, password) => {
    // Intercept the login API request
    cy.intercept('POST', '/api/auth/login', (req) => {
      // Mock a successful response
      req.reply({
        statusCode: 200,
        body: {
          data: {
            token: 'test-token',
            user: {
              id: '123',
              email: email,
              firstName: 'Test',
              lastName: 'User',
              role: 'user'
            }
          }
        }
      });
    }).as('loginRequest');
    
    // Visit login page
    cy.visit('/login');
    
    // Fill in login form
    cy.get('#formEmail').type(email);
    cy.get('#formPassword').type(password);
    
    // Submit form
    cy.contains('Login').click();
    
    // Wait for login request to complete
    cy.wait('@loginRequest');
    
    // Ensure we're redirected to home
    cy.url().should('not.include', '/login');
  });
  
  // Add a custom Cypress command to mock authentication
  Cypress.Commands.add('mockAuth', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
    
    // Set token and user in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'test-token');
      win.localStorage.setItem('user', JSON.stringify(mockUser));
    });
  });
  
  // Don't forget to export {} at the end of the file for TypeScript modules
  export {};