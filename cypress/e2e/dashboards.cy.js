describe('Dashboard Functionality', () => {
  describe('Executive Summary Dashboard', () => {
    beforeEach(() => {
      cy.visit('/mockups/1_executive_summary.html');
    });

    it('displays all key metrics', () => {
      cy.contains('Revenue Run Rate').should('be.visible');
      cy.contains('$57.6M').should('be.visible');
      cy.contains('EBITDA Margin').should('be.visible');
      cy.contains('Net Promoter Score').should('be.visible');
      cy.contains('Cash Runway').should('be.visible');
    });

    it('shows department performance matrix', () => {
      cy.contains('Department Performance Matrix').should('be.visible');
      cy.get('canvas#department-matrix').should('be.visible');
    });

    it('displays footnotes with data sources', () => {
      cy.contains('Data Sources & Methodology').should('be.visible');
      cy.get('.footnotes').should('exist');
      cy.get('.footnote-ref').should('have.length.greaterThan', 0);
    });
  });

  describe('Pricing Strategy Dashboard', () => {
    beforeEach(() => {
      cy.visit('/mockups/5_pricing_strategy.html');
    });

    it('displays pricing tiers', () => {
      cy.contains('Basic').should('be.visible');
      cy.contains('$99').should('be.visible');
      cy.contains('Professional').should('be.visible');
      cy.contains('$299').should('be.visible');
      cy.contains('Enterprise').should('be.visible');
      cy.contains('Custom').should('be.visible');
    });

    it('shows Data Science as a Service packages', () => {
      cy.contains('Data Science as a Service').should('be.visible');
      cy.contains('Starter Package').should('be.visible');
      cy.contains('$1,150').should('be.visible');
      cy.contains('Professional Package').should('be.visible');
      cy.contains('$2,150').should('be.visible');
      cy.contains('Enterprise Package').should('be.visible');
      cy.contains('$8,500/mo').should('be.visible');
    });

    it('displays competitive analysis table', () => {
      cy.contains('Competitive Pricing Analysis').should('be.visible');
      cy.get('.competitor-table').should('be.visible');
      cy.get('.competitor-table tbody tr').should('have.length.greaterThan', 3);
    });

    it('shows price elasticity chart', () => {
      cy.contains('Price Elasticity').should('be.visible');
      cy.get('canvas#elasticity-curve').should('be.visible');
    });
  });

  describe('Customer Insights Dashboard', () => {
    beforeEach(() => {
      cy.visit('/mockups/3_customer_insights.html');
    });

    it('displays customer segmentation', () => {
      cy.contains('Customer Segmentation').should('be.visible');
      cy.contains('Enterprise').should('be.visible');
      cy.contains('Mid-Market').should('be.visible');
      cy.contains('SMB').should('be.visible');
    });

    it('shows NPS breakdown', () => {
      cy.contains('NPS by Segment').should('be.visible');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('displays churn risk indicators', () => {
      cy.contains('Churn Risk').should('be.visible');
      cy.contains('High Risk').should('be.visible');
      cy.contains('Medium Risk').should('be.visible');
      cy.contains('Low Risk').should('be.visible');
    });
  });
});