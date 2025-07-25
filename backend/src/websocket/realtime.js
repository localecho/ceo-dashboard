class RealtimeManager {
  constructor(io) {
    this.io = io;
    this.updateIntervals = new Map();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    socket.on('subscribe', (data) => {
      const { dashboards, metrics } = data;
      
      // Join dashboard-specific rooms
      if (dashboards && Array.isArray(dashboards)) {
        dashboards.forEach(dashboard => {
          socket.join(`dashboard:${dashboard}`);
        });
      }
      
      // Join metric-specific rooms
      if (metrics && Array.isArray(metrics)) {
        metrics.forEach(metric => {
          socket.join(`metric:${metric}`);
        });
      }
      
      // Send initial data
      this.sendInitialData(socket, dashboards);
    });
    
    socket.on('unsubscribe', (data) => {
      const { dashboards, metrics } = data;
      
      if (dashboards && Array.isArray(dashboards)) {
        dashboards.forEach(dashboard => {
          socket.leave(`dashboard:${dashboard}`);
        });
      }
      
      if (metrics && Array.isArray(metrics)) {
        metrics.forEach(metric => {
          socket.leave(`metric:${metric}`);
        });
      }
    });
    
    socket.on('request-update', (data) => {
      this.handleUpdateRequest(socket, data);
    });
    
    socket.on('disconnect', () => {
      // Cleanup handled automatically
    });
  }

  sendInitialData(socket, dashboards) {
    dashboards.forEach(dashboard => {
      const data = this.getMockData(dashboard);
      socket.emit('initial-data', {
        dashboard,
        data,
        timestamp: new Date().toISOString()
      });
    });
  }

  handleUpdateRequest(socket, data) {
    const { dashboard, metric } = data;
    const updateData = this.getMockUpdate(dashboard, metric);
    
    socket.emit('metric-update', {
      dashboard,
      metric,
      data: updateData,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast updates to specific rooms
  broadcastMetricUpdate(metric, value) {
    this.io.to(`metric:${metric}`).emit('metric-update', {
      metric,
      value,
      timestamp: new Date().toISOString()
    });
  }

  broadcastDashboardUpdate(dashboard, data) {
    this.io.to(`dashboard:${dashboard}`).emit('dashboard-update', {
      dashboard,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Start automatic updates for demonstration
  startAutoUpdates() {
    // Update revenue metrics every 30 seconds
    this.updateIntervals.set('revenue', setInterval(() => {
      const revenueUpdate = {
        total: Math.floor(Math.random() * 100000) + 4700000,
        growth: (Math.random() * 5) + 10
      };
      this.broadcastMetricUpdate('revenue', revenueUpdate);
    }, 30000));
    
    // Update customer metrics every minute
    this.updateIntervals.set('customers', setInterval(() => {
      const customerUpdate = {
        active: Math.floor(Math.random() * 100) + 1200,
        nps: Math.floor(Math.random() * 10) + 65
      };
      this.broadcastMetricUpdate('customers', customerUpdate);
    }, 60000));
    
    // Update operational metrics every 10 seconds
    this.updateIntervals.set('operational', setInterval(() => {
      const operationalUpdate = {
        uptime: (Math.random() * 0.1) + 99.9,
        responseTime: Math.floor(Math.random() * 50) + 100,
        activeUsers: Math.floor(Math.random() * 500) + 8000
      };
      this.broadcastMetricUpdate('operational', operationalUpdate);
    }, 10000));
  }

  stopAutoUpdates() {
    this.updateIntervals.forEach((interval, key) => {
      clearInterval(interval);
      this.updateIntervals.delete(key);
    });
  }

  getMockData(dashboard) {
    const mockData = {
      'executive-summary': {
        revenue: { current: 4800000, target: 5000000, growth: 12.5 },
        customers: { total: 1234, active: 1189, nps: 72 },
        operational: { uptime: 99.9, incidents: 2, responseTime: 145 }
      },
      'revenue-operations': {
        pipeline: { total: 3500000, qualified: 2100000, closing: 800000 },
        performance: { quotaAttainment: 92, winRate: 34, dealCycle: 45 }
      },
      'customer-insights': {
        segments: {
          enterprise: { count: 234, mrr: 3510000 },
          midmarket: { count: 567, mrr: 2835000 },
          smb: { count: 433, mrr: 216500 }
        },
        health: { healthy: 892, atrisk: 267, churned: 75 }
      }
    };
    
    return mockData[dashboard] || {};
  }

  getMockUpdate(dashboard, metric) {
    const updates = {
      revenue: Math.floor(Math.random() * 100000) + 4700000,
      customers: Math.floor(Math.random() * 50) + 1200,
      uptime: (Math.random() * 0.1) + 99.9,
      nps: Math.floor(Math.random() * 5) + 70
    };
    
    return updates[metric] || Math.random() * 100;
  }
}

module.exports = RealtimeManager;