module.exports = {
  ci: {
    collect: {
      staticDistDir: './',
      url: [
        'http://localhost:8000/',
        'http://localhost:8000/mockups/1_executive_summary.html',
        'http://localhost:8000/mockups/2_revenue_operations.html',
        'http://localhost:8000/mockups/3_customer_insights.html',
        'http://localhost:8000/mockups/4_product_analytics.html',
        'http://localhost:8000/mockups/5_pricing_strategy.html',
        'http://localhost:8000/mockups/6_financial_performance.html',
        'http://localhost:8000/mockups/7_operational_excellence.html'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['warn', {minScore: 0.9}],
        'categories:seo': ['warn', {minScore: 0.9}],
        'first-contentful-paint': ['error', {maxNumericValue: 2000}],
        'interactive': ['error', {maxNumericValue: 3500}],
        'speed-index': ['error', {maxNumericValue: 3500}],
        'total-blocking-time': ['error', {maxNumericValue: 300}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: 'ceo-dashboard-%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%'
    }
  }
};