// Automated Insights Engine
class InsightsEngine {
  constructor() {
    this.thresholds = {
      revenue: { significant: 0.1, critical: 0.2 },
      churn: { warning: 0.05, critical: 0.1 },
      performance: { warning: 0.15, critical: 0.3 },
      nps: { decrease: 5, increase: 5 },
      costs: { warning: 0.1, critical: 0.2 }
    };
    
    this.templates = {
      revenue_increase: "Revenue increased by {percentage}% to ${value}, exceeding target by ${difference}",
      revenue_decrease: "Revenue declined by {percentage}% to ${value}, {urgency} attention required",
      churn_spike: "Customer churn rate increased to {rate}%, affecting {count} customers this period",
      performance_degradation: "{metric} degraded by {percentage}%, now at {value} {unit}",
      cost_overrun: "{category} costs exceeded budget by {percentage}%, totaling ${value}",
      positive_trend: "{metric} shows consistent improvement, up {percentage}% over {period}",
      anomaly_detected: "Unusual {metric} activity detected: {value} is {deviation}x normal range",
      milestone_achieved: "Milestone reached: {metric} surpassed {target} for the first time",
      forecast_alert: "{metric} projected to {direction} by {percentage}% in next {period}"
    };
  }

  // Generate insights from current data
  async generateInsights(currentData, historicalData, predictions) {
    const insights = [];
    
    // Revenue insights
    insights.push(...this.analyzeRevenue(currentData, historicalData));
    
    // Customer insights
    insights.push(...this.analyzeCustomers(currentData, historicalData));
    
    // Operational insights
    insights.push(...this.analyzeOperations(currentData, historicalData));
    
    // Predictive insights
    insights.push(...this.analyzePredictions(predictions));
    
    // Cross-metric insights
    insights.push(...this.analyzeCrossMetrics(currentData));
    
    // Sort by priority
    return this.prioritizeInsights(insights);
  }

  analyzeRevenue(current, historical) {
    const insights = [];
    const lastPeriod = historical[historical.length - 1];
    const change = (current.revenue - lastPeriod.revenue) / lastPeriod.revenue;
    
    if (Math.abs(change) > this.thresholds.revenue.significant) {
      const isIncrease = change > 0;
      const template = isIncrease ? 'revenue_increase' : 'revenue_decrease';
      
      insights.push({
        id: this.generateId(),
        type: 'revenue',
        title: isIncrease ? 'Revenue Growth Detected' : 'Revenue Decline Alert',
        description: this.fillTemplate(template, {
          percentage: Math.abs(change * 100).toFixed(1),
          value: current.revenue.toLocaleString(),
          difference: Math.abs(current.revenue - current.target).toLocaleString(),
          urgency: Math.abs(change) > this.thresholds.revenue.critical ? 'immediate' : 'prompt'
        }),
        severity: Math.abs(change) > this.thresholds.revenue.critical ? 'high' : 'medium',
        metric: 'revenue',
        value: current.revenue,
        change: change,
        recommendations: this.getRevenueRecommendations(change, current)
      });
    }
    
    // Segment analysis
    if (current.segments) {
      const segmentInsights = this.analyzeSegments(current.segments, historical);
      insights.push(...segmentInsights);
    }
    
    return insights;
  }

  analyzeCustomers(current, historical) {
    const insights = [];
    
    // Churn analysis
    if (current.churnRate > historical.avgChurnRate * (1 + this.thresholds.churn.warning)) {
      insights.push({
        id: this.generateId(),
        type: 'churn',
        title: 'Elevated Churn Risk',
        description: this.fillTemplate('churn_spike', {
          rate: (current.churnRate * 100).toFixed(1),
          count: current.churnedCustomers
        }),
        severity: current.churnRate > historical.avgChurnRate * (1 + this.thresholds.churn.critical) ? 'high' : 'medium',
        metric: 'churn_rate',
        value: current.churnRate,
        recommendations: [
          'Launch customer retention campaign',
          'Analyze churn reasons through exit surveys',
          'Implement proactive customer success outreach'
        ]
      });
    }
    
    // NPS changes
    const npsDelta = current.nps - historical.avgNps;
    if (Math.abs(npsDelta) > this.thresholds.nps.decrease) {
      insights.push({
        id: this.generateId(),
        type: 'satisfaction',
        title: npsDelta > 0 ? 'Customer Satisfaction Improving' : 'Customer Satisfaction Declining',
        description: `NPS score ${npsDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(npsDelta)} points to ${current.nps}`,
        severity: npsDelta < 0 ? 'medium' : 'low',
        metric: 'nps',
        value: current.nps,
        change: npsDelta,
        recommendations: npsDelta < 0 ? [
          'Review recent product changes',
          'Increase customer feedback collection',
          'Implement service quality improvements'
        ] : []
      });
    }
    
    return insights;
  }

  analyzeOperations(current, historical) {
    const insights = [];
    
    // Performance metrics
    const performanceMetrics = ['uptime', 'responseTime', 'errorRate'];
    
    performanceMetrics.forEach(metric => {
      if (current[metric] && historical[metric]) {
        const change = (current[metric] - historical[metric].avg) / historical[metric].avg;
        
        if (Math.abs(change) > this.thresholds.performance.warning) {
          const isImprovement = 
            (metric === 'uptime' && change > 0) || 
            (metric !== 'uptime' && change < 0);
          
          insights.push({
            id: this.generateId(),
            type: 'operational',
            title: `${this.formatMetricName(metric)} ${isImprovement ? 'Improved' : 'Degraded'}`,
            description: this.fillTemplate('performance_degradation', {
              metric: this.formatMetricName(metric),
              percentage: Math.abs(change * 100).toFixed(1),
              value: current[metric],
              unit: this.getMetricUnit(metric)
            }),
            severity: Math.abs(change) > this.thresholds.performance.critical ? 'high' : 'medium',
            metric: metric,
            value: current[metric],
            change: change,
            recommendations: !isImprovement ? this.getOperationalRecommendations(metric) : []
          });
        }
      }
    });
    
    return insights;
  }

  analyzePredictions(predictions) {
    const insights = [];
    
    if (predictions.revenue) {
      const forecast = predictions.revenue.predictions[0];
      const trend = forecast.revenue > predictions.revenue.current ? 'increase' : 'decrease';
      
      insights.push({
        id: this.generateId(),
        type: 'forecast',
        title: 'Revenue Forecast Update',
        description: this.fillTemplate('forecast_alert', {
          metric: 'Revenue',
          direction: trend,
          percentage: Math.abs(((forecast.revenue - predictions.revenue.current) / predictions.revenue.current) * 100).toFixed(1),
          period: '30 days'
        }),
        severity: 'info',
        metric: 'revenue_forecast',
        value: forecast.revenue,
        confidence: forecast.confidence,
        recommendations: trend === 'decrease' ? [
          'Review sales pipeline health',
          'Accelerate deal closures',
          'Implement revenue protection strategies'
        ] : []
      });
    }
    
    if (predictions.churn && predictions.churn.summary.highRisk > 10) {
      insights.push({
        id: this.generateId(),
        type: 'risk',
        title: 'High Churn Risk Alert',
        description: `${predictions.churn.summary.highRisk} customers identified as high churn risk`,
        severity: 'high',
        metric: 'churn_risk',
        value: predictions.churn.summary.highRisk,
        recommendations: [
          'Immediate outreach to high-risk customers',
          'Offer retention incentives',
          'Schedule executive business reviews'
        ]
      });
    }
    
    return insights;
  }

  analyzeCrossMetrics(current) {
    const insights = [];
    
    // Revenue per customer efficiency
    const revenuePerCustomer = current.revenue / current.customerCount;
    const efficiency = revenuePerCustomer / current.targetRevenuePerCustomer;
    
    if (efficiency < 0.8) {
      insights.push({
        id: this.generateId(),
        type: 'efficiency',
        title: 'Revenue Efficiency Below Target',
        description: `Revenue per customer is ${(efficiency * 100).toFixed(1)}% of target at $${revenuePerCustomer.toFixed(0)}`,
        severity: 'medium',
        metric: 'revenue_per_customer',
        value: revenuePerCustomer,
        recommendations: [
          'Focus on upselling existing customers',
          'Review pricing strategy',
          'Identify expansion opportunities'
        ]
      });
    }
    
    // Cost to revenue ratio
    if (current.costs && current.revenue) {
      const costRatio = current.costs / current.revenue;
      if (costRatio > 0.7) {
        insights.push({
          id: this.generateId(),
          type: 'financial',
          title: 'High Cost to Revenue Ratio',
          description: `Costs are ${(costRatio * 100).toFixed(1)}% of revenue, impacting profitability`,
          severity: costRatio > 0.85 ? 'high' : 'medium',
          metric: 'cost_ratio',
          value: costRatio,
          recommendations: [
            'Review operational efficiency',
            'Identify cost reduction opportunities',
            'Optimize resource allocation'
          ]
        });
      }
    }
    
    return insights;
  }

  prioritizeInsights(insights) {
    // Sort by severity and impact
    const severityOrder = { high: 3, medium: 2, low: 1, info: 0 };
    
    return insights.sort((a, b) => {
      // First by severity
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Then by absolute change magnitude
      const changeA = Math.abs(a.change || 0);
      const changeB = Math.abs(b.change || 0);
      return changeB - changeA;
    });
  }

  // Helper methods
  fillTemplate(templateName, values) {
    let template = this.templates[templateName];
    
    Object.entries(values).forEach(([key, value]) => {
      template = template.replace(`{${key}}`, value);
    });
    
    return template;
  }

  generateId() {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatMetricName(metric) {
    return metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  getMetricUnit(metric) {
    const units = {
      responseTime: 'ms',
      uptime: '%',
      errorRate: '%',
      revenue: 'USD',
      churnRate: '%'
    };
    return units[metric] || '';
  }

  analyzeSegments(segments, historical) {
    const insights = [];
    
    Object.entries(segments).forEach(([segment, data]) => {
      const historicalSegment = historical.segments?.[segment];
      if (historicalSegment) {
        const growth = (data.revenue - historicalSegment.avgRevenue) / historicalSegment.avgRevenue;
        
        if (Math.abs(growth) > 0.15) {
          insights.push({
            id: this.generateId(),
            type: 'segment',
            title: `${segment} Segment ${growth > 0 ? 'Outperforming' : 'Underperforming'}`,
            description: `${segment} revenue ${growth > 0 ? 'grew' : 'declined'} by ${Math.abs(growth * 100).toFixed(1)}%`,
            severity: growth < 0 ? 'medium' : 'info',
            metric: `${segment}_revenue`,
            value: data.revenue,
            change: growth
          });
        }
      }
    });
    
    return insights;
  }

  getRevenueRecommendations(change, current) {
    if (change < 0) {
      return [
        'Analyze deal pipeline for bottlenecks',
        'Review competitive positioning',
        'Accelerate sales cycle',
        'Implement win-back campaigns'
      ];
    } else {
      return [
        'Capitalize on momentum with upsells',
        'Expand successful campaigns',
        'Document and replicate success factors'
      ];
    }
  }

  getOperationalRecommendations(metric) {
    const recommendations = {
      uptime: [
        'Review recent deployments for issues',
        'Implement additional monitoring',
        'Scale infrastructure if needed'
      ],
      responseTime: [
        'Analyze slow queries',
        'Optimize database indexes',
        'Review caching strategy'
      ],
      errorRate: [
        'Review error logs for patterns',
        'Implement additional error handling',
        'Increase test coverage'
      ]
    };
    
    return recommendations[metric] || [];
  }
}

module.exports = InsightsEngine;