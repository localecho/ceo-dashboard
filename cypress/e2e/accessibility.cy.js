describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.injectAxe();
  });

  it('main page has no accessibility violations', () => {
    cy.visit('/');
    cy.checkA11y();
  });

  it('executive summary dashboard has no violations', () => {
    cy.visit('/mockups/1_executive_summary.html');
    cy.checkA11y();
  });

  it('pricing strategy dashboard has no violations', () => {
    cy.visit('/mockups/5_pricing_strategy.html');
    cy.checkA11y();
  });

  it('has proper heading hierarchy', () => {
    cy.visit('/');
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('have.length.greaterThan', 0);
  });

  it('all images have alt text', () => {
    cy.visit('/');
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });

  it('links have descriptive text', () => {
    cy.visit('/');
    cy.get('a').each(($link) => {
      cy.wrap($link).should('not.have.text', '');
    });
  });

  it('color contrast meets WCAG standards', () => {
    cy.visit('/');
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('keyboard navigation works', () => {
    cy.visit('/');
    cy.get('body').tab();
    cy.focused().should('exist');
  });
});