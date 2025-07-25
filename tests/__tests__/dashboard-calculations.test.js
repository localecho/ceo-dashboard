describe('Dashboard Calculations', () => {
  describe('Financial Metrics', () => {
    test('calculates ARPU correctly', () => {
      const totalRevenue = 4800000; // $4.8M
      const activeUsers = 12300;
      const expectedARPU = 391; // rounded
      
      const arpu = Math.round(totalRevenue / activeUsers);
      expect(arpu).toBe(expectedARPU);
    });

    test('calculates price realization percentage', () => {
      const actualRevenue = 4176000;
      const listPriceRevenue = 4800000;
      const expectedRealization = 87;
      
      const realization = Math.round((actualRevenue / listPriceRevenue) * 100);
      expect(realization).toBe(expectedRealization);
    });

    test('calculates discount rate', () => {
      const totalDiscounts = 624000;
      const grossRevenue = 4800000;
      const expectedRate = 13;
      
      const discountRate = Math.round((totalDiscounts / grossRevenue) * 100);
      expect(discountRate).toBe(expectedRate);
    });

    test('calculates upsell rate', () => {
      const upsoldCustomers = 418;
      const totalEligibleCustomers = 1229;
      const expectedRate = 34;
      
      const upsellRate = Math.round((upsoldCustomers / totalEligibleCustomers) * 100);
      expect(upsellRate).toBe(expectedRate);
    });
  });

  describe('Customer Metrics', () => {
    test('calculates NPS correctly', () => {
      const promoters = 523;
      const detractors = 187;
      const totalRespondents = 1000;
      const expectedNPS = 34; // (52.3% - 18.7%)
      
      const nps = Math.round(((promoters - detractors) / totalRespondents) * 100);
      expect(nps).toBe(expectedNPS);
    });

    test('calculates churn rate', () => {
      const churnedCustomers = 47;
      const totalCustomers = 1200;
      const expectedChurnRate = 3.9;
      
      const churnRate = Math.round((churnedCustomers / totalCustomers) * 100 * 10) / 10;
      expect(churnRate).toBe(expectedChurnRate);
    });

    test('calculates customer lifetime value', () => {
      const avgMonthlyRevenue = 299;
      const avgCustomerLifespan = 36; // months
      const expectedLTV = 10764;
      
      const ltv = avgMonthlyRevenue * avgCustomerLifespan;
      expect(ltv).toBe(expectedLTV);
    });
  });

  describe('Operational Metrics', () => {
    test('calculates system uptime percentage', () => {
      const totalMinutes = 43200; // 30 days
      const downtime = 43; // minutes
      const expectedUptime = 99.9;
      
      const uptime = Math.round(((totalMinutes - downtime) / totalMinutes) * 1000) / 10;
      expect(uptime).toBe(expectedUptime);
    });

    test('calculates API response time percentiles', () => {
      const responseTimes = [45, 52, 48, 51, 47, 89, 92, 46, 50, 53];
      responseTimes.sort((a, b) => a - b);
      
      const p50Index = Math.floor(responseTimes.length * 0.5);
      const p95Index = Math.floor(responseTimes.length * 0.95);
      
      expect(responseTimes[p50Index]).toBe(50);
      expect(responseTimes[p95Index]).toBe(92);
    });
  });

  describe('Revenue Mix Analysis', () => {
    test('calculates revenue distribution percentages', () => {
      const subscriptionRevenue = 3650000;
      const servicesRevenue = 864000;
      const addOnsRevenue = 288000;
      const totalRevenue = subscriptionRevenue + servicesRevenue + addOnsRevenue;
      
      const subscriptionPercent = Math.round((subscriptionRevenue / totalRevenue) * 100);
      const servicesPercent = Math.round((servicesRevenue / totalRevenue) * 100);
      const addOnsPercent = Math.round((addOnsRevenue / totalRevenue) * 100);
      
      expect(subscriptionPercent).toBe(76);
      expect(servicesPercent).toBe(18);
      expect(addOnsPercent).toBe(6);
    });
  });

  describe('Price Elasticity', () => {
    test('calculates revenue index for different price points', () => {
      const basePriceRevenue = 100;
      const priceChanges = [
        { price: 249, conversion: 0.38, expectedIndex: 112 },
        { price: 299, conversion: 0.31, expectedIndex: 100 },
        { price: 349, conversion: 0.24, expectedIndex: 91 },
        { price: 399, conversion: 0.17, expectedIndex: 76 }
      ];
      
      priceChanges.forEach(({ price, conversion, expectedIndex }) => {
        const relativePrice = price / 299;
        const relativeRevenue = relativePrice * conversion / 0.31;
        const revenueIndex = Math.round(relativeRevenue * 100);
        expect(revenueIndex).toBe(expectedIndex);
      });
    });
  });
});