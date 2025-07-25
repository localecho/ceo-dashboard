describe('Visual Regression Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ];

  describe('Main Navigation Page', () => {
    viewports.forEach(({ name, width, height }) => {
      it(`captures ${name} view`, () => {
        cy.viewport(width, height);
        cy.visit('/');
        cy.wait(500); // Wait for any animations
        cy.compareSnapshot(`Homepage - ${name}`);
      });
    });

    it('captures hover states', () => {
      cy.visit('/');
      cy.get('.dashboard-card').first().trigger('mouseover');
      cy.wait(300); // Wait for hover animation
      cy.compareSnapshot('Homepage - Card Hover');
    });
  });

  describe('Dashboard Visual Tests', () => {
    const dashboards = [
      { url: '/mockups/1_executive_summary.html', name: 'Executive Summary' },
      { url: '/mockups/2_revenue_operations.html', name: 'Revenue Operations' },
      { url: '/mockups/3_customer_insights.html', name: 'Customer Insights' },
      { url: '/mockups/4_product_analytics.html', name: 'Product Analytics' },
      { url: '/mockups/5_pricing_strategy.html', name: 'Pricing Strategy' },
      { url: '/mockups/6_financial_performance.html', name: 'Financial Performance' },
      { url: '/mockups/7_operational_excellence.html', name: 'Operational Excellence' }
    ];

    dashboards.forEach(({ url, name }) => {
      describe(name, () => {
        it('captures full dashboard', () => {
          cy.visit(url);
          cy.waitForCharts();
          cy.compareSnapshot(`${name} - Full Page`);
        });

        it('captures dashboard at tablet size', () => {
          cy.viewport(768, 1024);
          cy.visit(url);
          cy.waitForCharts();
          cy.compareSnapshot(`${name} - Tablet`);
        });

        it('captures key sections', () => {
          cy.visit(url);
          cy.waitForCharts();
          
          // Capture header section
          cy.get('.bcg-header').scrollIntoView();
          cy.compareSnapshot(`${name} - Header Section`);
          
          // Capture first chart
          cy.get('canvas').first().scrollIntoView();
          cy.compareSnapshot(`${name} - First Chart`);
          
          // Capture footnotes
          cy.get('.footnotes').scrollIntoView();
          cy.compareSnapshot(`${name} - Footnotes`);
        });
      });
    });
  });

  describe('Interactive Elements', () => {
    it('captures pricing tier comparison', () => {
      cy.visit('/mockups/5_pricing_strategy.html');
      cy.waitForCharts();
      cy.get('.pricing-tiers').scrollIntoView();
      cy.compareSnapshot('Pricing Tiers Comparison');
    });

    it('captures competitor table', () => {
      cy.visit('/mockups/5_pricing_strategy.html');
      cy.get('.competitor-table').scrollIntoView();
      cy.compareSnapshot('Competitor Analysis Table');
    });

    it('captures recommendation box', () => {
      cy.visit('/mockups/5_pricing_strategy.html');
      cy.get('.recommendation-box').scrollIntoView();
      cy.compareSnapshot('Strategic Recommendations');
    });
  });

  describe('Chart Rendering', () => {
    it('verifies all charts render correctly', () => {
      cy.visit('/mockups/1_executive_summary.html');
      cy.waitForCharts();
      
      cy.get('canvas').each(($canvas, index) => {
        cy.wrap($canvas).scrollIntoView();
        cy.wait(200); // Wait for scroll
        cy.compareSnapshot(`Executive Summary - Chart ${index + 1}`);
      });
    });
  });

  describe('Dark Mode Tests', () => {
    beforeEach(() => {
      // Simulate dark mode preference
      cy.visit('/', {
        onBeforeLoad: (win) => {
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({ matches: true });
        }
      });
    });

    it('captures dark mode variations', () => {
      cy.compareSnapshot('Homepage - Dark Mode');
    });
  });
});