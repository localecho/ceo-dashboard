// Predictive Analytics Engine
class PredictiveAnalytics {
  constructor() {
    this.models = new Map();
    this.cache = new Map();
  }

  // Revenue Forecasting
  async forecastRevenue(historicalData, periods = 3) {
    // Simple linear regression for demonstration
    const n = historicalData.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = historicalData.map(d => d.revenue);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate predictions
    const predictions = [];
    for (let i = 0; i < periods; i++) {
      const nextX = n + i;
      const predictedRevenue = slope * nextX + intercept;
      
      // Add confidence interval (simplified)
      const variance = this.calculateVariance(y, predictedRevenue);
      const confidenceInterval = 1.96 * Math.sqrt(variance);
      
      predictions.push({
        period: nextX,
        revenue: Math.max(0, predictedRevenue),
        lowerBound: Math.max(0, predictedRevenue - confidenceInterval),
        upperBound: predictedRevenue + confidenceInterval,
        confidence: 0.95
      });
    }
    
    return {
      predictions,
      model: {
        type: 'linear_regression',
        slope,
        intercept,
        r2: this.calculateR2(y, x.map(xi => slope * xi + intercept))
      }
    };
  }

  // Churn Prediction
  async predictChurn(customerData) {
    // Simplified churn scoring based on multiple factors
    const churnScores = customerData.map(customer => {
      let score = 0;
      
      // Factor 1: Days since last activity
      const daysSinceActivity = this.daysBetween(new Date(customer.lastActivity), new Date());
      if (daysSinceActivity > 90) score += 30;
      else if (daysSinceActivity > 60) score += 20;
      else if (daysSinceActivity > 30) score += 10;
      
      // Factor 2: NPS Score
      if (customer.npsScore < 6) score += 25;
      else if (customer.npsScore < 8) score += 10;
      
      // Factor 3: Support tickets
      if (customer.openTickets > 3) score += 20;
      else if (customer.openTickets > 1) score += 10;
      
      // Factor 4: Usage decline
      const usageDecline = (customer.lastMonthUsage - customer.currentMonthUsage) / customer.lastMonthUsage;
      if (usageDecline > 0.5) score += 25;
      else if (usageDecline > 0.25) score += 15;
      
      // Factor 5: Payment issues
      if (customer.failedPayments > 0) score += 15;
      
      return {
        customerId: customer.id,
        churnProbability: Math.min(score, 100) / 100,
        riskLevel: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
        factors: {
          inactivity: daysSinceActivity > 30,
          lowSatisfaction: customer.npsScore < 8,
          supportIssues: customer.openTickets > 1,
          usageDecline: usageDecline > 0.25,
          paymentIssues: customer.failedPayments > 0
        }
      };
    });
    
    return {
      predictions: churnScores,
      summary: {
        highRisk: churnScores.filter(s => s.riskLevel === 'high').length,
        mediumRisk: churnScores.filter(s => s.riskLevel === 'medium').length,
        lowRisk: churnScores.filter(s => s.riskLevel === 'low').length,
        avgChurnProbability: churnScores.reduce((sum, s) => sum + s.churnProbability, 0) / churnScores.length
      }
    };
  }

  // Anomaly Detection
  async detectAnomalies(metrics, threshold = 2) {
    const anomalies = [];
    
    for (const [metricName, values] of Object.entries(metrics)) {
      const mean = this.calculateMean(values);
      const stdDev = this.calculateStdDev(values, mean);
      
      values.forEach((value, index) => {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > threshold) {
          anomalies.push({
            metric: metricName,
            timestamp: new Date(Date.now() - (values.length - index) * 3600000),
            value: value,
            expectedRange: {
              min: mean - threshold * stdDev,
              max: mean + threshold * stdDev
            },
            severity: zScore > 3 ? 'critical' : 'warning',
            zScore: zScore
          });
        }
      });
    }
    
    return {
      anomalies: anomalies.sort((a, b) => b.zScore - a.zScore),
      summary: {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        warning: anomalies.filter(a => a.severity === 'warning').length
      }
    };
  }

  // Trend Analysis
  async analyzeTrends(data, metrics) {
    const trends = {};
    
    for (const metric of metrics) {
      const values = data.map(d => d[metric]);
      const n = values.length;
      
      // Calculate trend direction
      const firstHalf = values.slice(0, Math.floor(n / 2));
      const secondHalf = values.slice(Math.floor(n / 2));
      const firstAvg = this.calculateMean(firstHalf);
      const secondAvg = this.calculateMean(secondHalf);
      
      const trendDirection = secondAvg > firstAvg ? 'increasing' : 'decreasing';
      const trendStrength = Math.abs((secondAvg - firstAvg) / firstAvg);
      
      // Moving average
      const movingAvg = this.calculateMovingAverage(values, 3);
      
      // Seasonality detection (simplified)
      const seasonality = this.detectSeasonality(values);
      
      trends[metric] = {
        direction: trendDirection,
        strength: trendStrength,
        currentValue: values[values.length - 1],
        movingAverage: movingAvg[movingAvg.length - 1],
        change: {
          absolute: values[values.length - 1] - values[0],
          percentage: ((values[values.length - 1] - values[0]) / values[0]) * 100
        },
        seasonality: seasonality
      };
    }
    
    return trends;
  }

  // Scenario Modeling
  async modelScenarios(baseData, scenarios) {
    const results = {};
    
    for (const [scenarioName, parameters] of Object.entries(scenarios)) {
      const projectedData = { ...baseData };
      
      // Apply scenario parameters
      for (const [param, change] of Object.entries(parameters)) {
        if (projectedData[param]) {
          projectedData[param] = projectedData[param] * (1 + change);
        }
      }
      
      // Calculate impacts
      const revenue = this.calculateProjectedRevenue(projectedData);
      const costs = this.calculateProjectedCosts(projectedData);
      const profit = revenue - costs;
      const margin = (profit / revenue) * 100;
      
      results[scenarioName] = {
        parameters,
        projections: {
          revenue,
          costs,
          profit,
          margin,
          roi: ((profit - baseData.currentProfit) / baseData.currentProfit) * 100
        },
        feasibility: this.assessFeasibility(parameters)
      };
    }
    
    return results;
  }

  // Utility Methods
  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateStdDev(values, mean) {
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateVariance(actual, predicted) {
    const residuals = actual.map((val, i) => val - predicted);
    const squaredResiduals = residuals.map(r => r * r);
    return squaredResiduals.reduce((sum, val) => sum + val, 0) / actual.length;
  }

  calculateR2(actual, predicted) {
    const actualMean = this.calculateMean(actual);
    const totalSS = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSS = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    return 1 - (residualSS / totalSS);
  }

  calculateMovingAverage(values, window) {
    const result = [];
    for (let i = window - 1; i < values.length; i++) {
      const windowValues = values.slice(i - window + 1, i + 1);
      result.push(this.calculateMean(windowValues));
    }
    return result;
  }

  detectSeasonality(values) {
    // Simplified seasonality detection
    if (values.length < 12) return { detected: false };
    
    const monthlyAvg = [];
    for (let i = 0; i < 12; i++) {
      const monthValues = values.filter((_, index) => index % 12 === i);
      if (monthValues.length > 0) {
        monthlyAvg.push(this.calculateMean(monthValues));
      }
    }
    
    const variance = this.calculateStdDev(monthlyAvg, this.calculateMean(monthlyAvg));
    const hasSeasonality = variance > this.calculateMean(monthlyAvg) * 0.1;
    
    return {
      detected: hasSeasonality,
      pattern: hasSeasonality ? 'monthly' : null,
      strength: hasSeasonality ? variance / this.calculateMean(monthlyAvg) : 0
    };
  }

  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date2 - date1) / oneDay));
  }

  calculateProjectedRevenue(data) {
    return data.customerCount * data.avgRevPerCustomer * (1 + data.growthRate);
  }

  calculateProjectedCosts(data) {
    return data.fixedCosts + (data.variableCostPerUnit * data.unitsSold);
  }

  assessFeasibility(parameters) {
    let feasibilityScore = 100;
    
    for (const [param, change] of Object.entries(parameters)) {
      if (Math.abs(change) > 0.5) feasibilityScore -= 20;
      else if (Math.abs(change) > 0.3) feasibilityScore -= 10;
    }
    
    return {
      score: Math.max(0, feasibilityScore),
      rating: feasibilityScore > 80 ? 'high' : feasibilityScore > 50 ? 'medium' : 'low'
    };
  }
}

module.exports = PredictiveAnalytics;