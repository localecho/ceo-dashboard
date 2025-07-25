// Import commands.js
import './commands';

// Import cypress-axe for accessibility testing
import 'cypress-axe';

// Import Percy for visual testing (optional)
import '@percy/cypress';

// Global beforeEach to ensure clean state
beforeEach(() => {
  // Clear any localStorage/sessionStorage
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // when there are uncaught exceptions in the application
  return false;
});