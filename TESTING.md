# CEO Dashboard Testing Documentation

## 🧪 Testing Strategy Overview

This document outlines the comprehensive testing approach for the BCG CEO Dashboard Suite, covering unit tests, integration tests, accessibility compliance, performance benchmarks, and visual regression testing.

## 📋 Test Coverage Matrix

| Test Type | Tool | Coverage | Purpose |
|-----------|------|----------|---------|
| Unit Tests | Jest | 80%+ | Validate calculations and business logic |
| Integration Tests | Cypress | All pages | Ensure navigation and data flow |
| Accessibility Tests | Cypress + Axe | WCAG 2.1 AA | Ensure compliance for all users |
| Performance Tests | Lighthouse CI | Core Web Vitals | Monitor load times and rendering |
| Visual Regression | Percy + Cypress | All viewports | Catch unintended UI changes |
| Cross-browser | Manual + BrowserStack | Chrome, Safari, Firefox, Edge | Ensure compatibility |

## 🚀 Quick Start

### Installation
```bash
# Install all testing dependencies
npm install

# For E2E tests, ensure you have Chrome installed
```

### Running Tests

#### All Tests
```bash
npm run test:all
```

#### Unit Tests
```bash
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

#### E2E Tests
```bash
npm run test:e2e           # Headless mode
npm run test:e2e:open      # Interactive mode
```

#### Accessibility Tests
```bash
npm run test:a11y
```

#### Performance Tests
```bash
# Start local server first
python -m http.server 8000

# In another terminal
npm run test:performance
```

#### Visual Regression Tests
```bash
# Requires PERCY_TOKEN environment variable
export PERCY_TOKEN=your_percy_token
npm run test:visual
```

## 📊 Test Suites Breakdown

### 1. Unit Tests (`tests/__tests__/`)

#### Financial Calculations (`dashboard-calculations.test.js`)
- **ARPU Calculation**: Validates Average Revenue Per User formula
- **Price Realization**: Tests discount impact calculations
- **Discount Rate**: Verifies weighted discount calculations
- **Upsell Rate**: Tests customer upgrade tracking
- **NPS Calculation**: Validates Net Promoter Score formula
- **Churn Rate**: Tests customer retention metrics
- **LTV Calculation**: Validates lifetime value projections
- **Uptime Percentage**: Tests system availability calculations
- **Response Time Percentiles**: Validates P50/P95 calculations
- **Revenue Mix**: Tests revenue distribution percentages
- **Price Elasticity**: Validates pricing optimization models

### 2. Integration Tests (`cypress/e2e/`)

#### Navigation Tests (`navigation.cy.js`)
- Main page loads with all 7 dashboard cards
- Each dashboard link navigates correctly
- Professional features section displays
- Footer links are functional
- Responsive navigation works on mobile

#### Dashboard Tests (`dashboards.cy.js`)
- **Executive Summary**: KPIs, department matrix, footnotes
- **Pricing Strategy**: Tiers, DSaaS packages, competitive analysis
- **Customer Insights**: Segmentation, NPS, churn indicators
- All charts render correctly
- Data updates are reflected in UI

### 3. Accessibility Tests (`cypress/e2e/accessibility.cy.js`)

#### WCAG 2.1 Compliance
- **Level A**: Basic accessibility features
- **Level AA**: Color contrast, keyboard navigation
- **Screen Readers**: Proper ARIA labels and landmarks
- **Keyboard Navigation**: Tab order and focus indicators
- **Forms**: All inputs have labels
- **Images**: Alt text for all visual content
- **Headings**: Proper hierarchy (h1 → h2 → h3)

#### Specific Checks
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- All interactive elements are keyboard accessible
- Focus indicators are visible
- No keyboard traps
- Charts have text alternatives

### 4. Performance Tests (`lighthouserc.js`)

#### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 2s
- **TTI** (Time to Interactive): < 3.5s
- **SI** (Speed Index): < 3.5s

#### Performance Budget
- JavaScript bundle: < 200KB gzipped
- CSS: < 50KB gzipped
- Images: Optimized and lazy-loaded
- Total page weight: < 1MB

### 5. Visual Regression Tests (`cypress/e2e/visual-regression.cy.js`)

#### Coverage
- All pages at 3 viewports (mobile, tablet, desktop)
- Hover states and interactions
- Chart rendering consistency
- Dark mode variations
- Print styles

#### Key Snapshots
- Homepage with navigation cards
- Each dashboard full page
- Individual chart components
- Interactive elements (dropdowns, tables)
- Responsive breakpoints

## 🔍 Test Data Management

### Mock Data Location
- Unit tests: Inline in test files
- E2E tests: `cypress/fixtures/`
- Visual tests: Production data

### Data Scenarios Tested
1. **Happy Path**: Normal business operations
2. **Edge Cases**: Zero values, missing data
3. **Stress Test**: Large datasets (10k+ records)
4. **Error States**: API failures, network issues

## 🐛 Common Issues and Solutions

### Chart.js Canvas Errors
**Problem**: "Cannot read property 'getContext' of null"
**Solution**: Mock canvas in test setup or wait for DOM ready

### Cypress Timeout Issues
**Problem**: Element not found within timeout
**Solution**: Use `cy.waitForCharts()` custom command

### Percy Snapshot Differences
**Problem**: Fonts or animations causing false positives
**Solution**: Wait for animations, use web fonts

### Accessibility False Positives
**Problem**: Color contrast on gradients
**Solution**: Use solid colors for critical text

## 📈 Test Metrics and Reporting

### Coverage Goals
- **Unit Test Coverage**: 80% minimum
- **E2E Critical Paths**: 100% coverage
- **Accessibility**: 0 violations
- **Performance Score**: 90+ on all pages

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm test
    - run: npm run test:e2e
    - run: npm run test:performance
```

### Test Reports
- **Unit Tests**: `coverage/lcov-report/index.html`
- **E2E Videos**: `cypress/videos/`
- **Screenshots**: `cypress/screenshots/`
- **Lighthouse**: `lighthouse-reports/`

## 🔄 Continuous Testing Strategy

### Daily
- Unit tests on every commit
- E2E tests on PR merges
- Accessibility checks on changes

### Weekly
- Full visual regression suite
- Cross-browser testing
- Performance benchmarking

### Monthly
- Security vulnerability scan
- Dependency updates
- Test suite optimization

## 🎯 Testing Best Practices

### Writing Tests
1. **Descriptive Names**: Test names should explain what and why
2. **Arrange-Act-Assert**: Clear test structure
3. **Independent Tests**: No test should depend on another
4. **Real User Scenarios**: Test actual user workflows
5. **Data-Driven**: Use fixtures for consistency

### Maintaining Tests
1. **Regular Reviews**: Remove obsolete tests
2. **Performance**: Keep test suite fast (< 5 minutes)
3. **Flaky Tests**: Fix or remove unreliable tests
4. **Documentation**: Update this doc with new patterns

### Debugging Failed Tests
1. **Check Logs**: Review console output
2. **Screenshots**: Cypress captures on failure
3. **Videos**: Review test execution
4. **Local Reproduction**: Run single test locally
5. **Git Bisect**: Find when test started failing

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Percy Visual Testing](https://percy.io/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add new test cases for edge cases
4. Update this documentation
5. Run full test suite before PR

---

*Testing is not about finding bugs, it's about building confidence in our code.*