// Custom command for keyboard navigation
Cypress.Commands.add('tab', () => {
  cy.focused().trigger('keydown', { keyCode: 9, which: 9, key: 'Tab' });
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.greaterThan(-1);
  expect(rect.bottom).to.be.lessThan(
    Cypress.config('viewportHeight') + 1
  );
  
  return subject;
});

// Custom command to wait for charts to render
Cypress.Commands.add('waitForCharts', () => {
  cy.get('canvas').should('be.visible');
  cy.wait(500); // Give charts time to animate
});

// Custom command to check metric card
Cypress.Commands.add('checkMetricCard', (label, value) => {
  cy.contains(label)
    .parent()
    .within(() => {
      cy.contains(value).should('be.visible');
    });
});

// Custom command to navigate to dashboard
Cypress.Commands.add('navigateToDashboard', (dashboardName) => {
  cy.visit('/');
  cy.contains(dashboardName).parent().click();
  cy.waitForCharts();
});

// Custom command to check footnote
Cypress.Commands.add('checkFootnote', (refNumber) => {
  cy.get(`.footnote-ref:contains("${refNumber}")`)
    .should('be.visible')
    .click();
  
  cy.get(`#fn${refNumber}`).should('be.visible');
});

// Custom command for visual regression testing
Cypress.Commands.add('compareSnapshot', (name, options = {}) => {
  cy.percySnapshot(name, {
    widths: [375, 768, 1280],
    minHeight: 1024,
    ...options
  });
});