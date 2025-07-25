const express = require('express');
const router = express.Router();

// Get executive summary metrics
router.get('/executive-summary', async (req, res) => {
  try {
    // Mock data for now - will be replaced with actual database queries
    const data = {
      revenue: {
        total_revenue: 4800000,
        customer_count: 1234,
        avg_deal_size: 3890
      },
      customers: {
        avg_nps: 72,
        high_risk_count: 47,
        avg_health_score: 85
      },
      operational: [
        { metric_name: 'API Response Time', metric_value: 145, unit: 'ms' },
        { metric_name: 'System Uptime', metric_value: 99.9, unit: '%' },
        { metric_name: 'Active Users', metric_value: 8234, unit: 'users' }
      ],
      timestamp: new Date().toISOString()
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executive summary' });
  }
});

// Get revenue operations data
router.get('/revenue-operations', async (req, res) => {
  try {
    const data = {
      pipeline: [
        { stage: 'Lead', count: 234, value: 1250000 },
        { stage: 'Qualified', count: 156, value: 980000 },
        { stage: 'Proposal', count: 89, value: 750000 },
        { stage: 'Negotiation', count: 45, value: 425000 },
        { stage: 'Closed Won', count: 34, value: 380000 }
      ],
      performance: {
        quota_attainment: 92,
        win_rate: 34,
        avg_deal_cycle: 45
      }
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue operations data' });
  }
});

// Get customer insights
router.get('/customer-insights', async (req, res) => {
  try {
    const data = {
      segments: [
        { segment: 'Enterprise', count: 234, avg_mrr: 15000, avg_nps: 78 },
        { segment: 'Mid-Market', count: 567, avg_mrr: 5000, avg_nps: 72 },
        { segment: 'SMB', count: 1234, avg_mrr: 500, avg_nps: 65 }
      ],
      churn_risk: {
        high: 47,
        medium: 123,
        low: 1864
      }
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
});

// Get product analytics
router.get('/product-analytics', async (req, res) => {
  try {
    const data = {
      features: [
        { name: 'Dashboard', adoption_rate: 92, dau: 7234, retention: 85 },
        { name: 'Reports', adoption_rate: 78, dau: 5123, retention: 72 },
        { name: 'API', adoption_rate: 45, dau: 2345, retention: 90 }
      ],
      usage_trend: {
        daily_active: 8234,
        monthly_active: 12456,
        growth_rate: 15
      }
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

// Get financial performance
router.get('/financial-performance', async (req, res) => {
  try {
    const data = {
      revenue: 4800000,
      expenses: 3200000,
      ebitda: 1600000,
      margin: 33.3,
      cash_position: 8500000,
      burn_rate: 450000
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial performance' });
  }
});

// Get operational excellence metrics
router.get('/operational-excellence', async (req, res) => {
  try {
    const data = {
      uptime: 99.9,
      response_time: {
        p50: 145,
        p95: 289,
        p99: 512
      },
      error_rate: 0.3,
      deployment_frequency: 23,
      mttr: 12
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch operational metrics' });
  }
});

module.exports = router;