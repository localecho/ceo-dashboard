describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the main navigation page', () => {
    cy.contains('BCG Dashboard Suite').should('be.visible');
    cy.contains('CEO Dashboard Showcase').should('be.visible');
    cy.contains('7 Comprehensive Dashboard Views').should('be.visible');
  });

  it('shows all 7 dashboard cards', () => {
    const dashboards = [
      'Executive Summary',
      'Revenue Operations',
      'Customer Insights',
      'Product Analytics',
      'Pricing Strategy',
      'Financial Performance',
      'Operational Excellence'
    ];

    dashboards.forEach(dashboard => {
      cy.contains(dashboard).should('be.visible');
    });
  });

  it('navigates to Executive Summary dashboard', () => {
    cy.contains('Executive Summary').parent().click();
    cy.url().should('include', '/mockups/1_executive_summary.html');
    cy.contains('Executive Dashboard').should('be.visible');
  });

  it('navigates to Revenue Operations dashboard', () => {
    cy.contains('Revenue Operations').parent().click();
    cy.url().should('include', '/mockups/2_revenue_operations.html');
    cy.contains('Revenue Operations Dashboard').should('be.visible');
  });

  it('navigates to Customer Insights dashboard', () => {
    cy.contains('Customer Insights').parent().click();
    cy.url().should('include', '/mockups/3_customer_insights.html');
    cy.contains('Customer Insights Dashboard').should('be.visible');
  });

  it('navigates to Product Analytics dashboard', () => {
    cy.contains('Product Analytics').parent().click();
    cy.url().should('include', '/mockups/4_product_analytics.html');
    cy.contains('Product Analytics Dashboard').should('be.visible');
  });

  it('navigates to Pricing Strategy dashboard', () => {
    cy.contains('Pricing Strategy').parent().click();
    cy.url().should('include', '/mockups/5_pricing_strategy.html');
    cy.contains('Pricing Strategy Dashboard').should('be.visible');
  });

  it('navigates to Financial Performance dashboard', () => {
    cy.contains('Financial Performance').parent().click();
    cy.url().should('include', '/mockups/6_financial_performance.html');
    cy.contains('Financial Performance Dashboard').should('be.visible');
  });

  it('navigates to Operational Excellence dashboard', () => {
    cy.contains('Operational Excellence').parent().click();
    cy.url().should('include', '/mockups/7_operational_excellence.html');
    cy.contains('Operational Excellence Dashboard').should('be.visible');
  });

  it('displays professional features section', () => {
    cy.contains('Professional Features').should('be.visible');
    cy.contains('BCG Standards').should('be.visible');
    cy.contains('Complete Attribution').should('be.visible');
    cy.contains('Tufte Principles').should('be.visible');
    cy.contains('Strategic Insights').should('be.visible');
  });

  it('shows footer with links', () => {
    cy.contains('View on GitHub').should('have.attr', 'href').and('include', 'github.com');
    cy.contains('Live Demo').should('have.attr', 'href').and('include', 'vercel.app');
  });
});