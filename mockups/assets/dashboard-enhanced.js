// Dashboard Enhancement Module
class DashboardEnhancer {
  constructor() {
    this.socket = null;
    this.filters = {};
    this.theme = localStorage.getItem('theme') || 'light';
    this.layout = null;
    this.charts = new Map();
    this.updateCallbacks = new Map();
  }

  initialize() {
    this.connectWebSocket();
    this.initializeFilters();
    this.initializeTheme();
    this.initializeLayout();
    this.bindEventListeners();
  }

  // WebSocket connection for real-time updates
  connectWebSocket() {
    const wsUrl = window.location.hostname === 'localhost' 
      ? 'ws://localhost:3001' 
      : 'wss://api.ceo-dashboard.com';
    
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.updateConnectionStatus('connected');
      this.subscribeToUpdates();
    });

    this.socket.on('disconnect', () => {
      this.updateConnectionStatus('disconnected');
    });

    this.socket.on('metric-update', (data) => {
      this.handleMetricUpdate(data);
    });

    this.socket.on('dashboard-update', (data) => {
      this.handleDashboardUpdate(data);
    });
  }

  subscribeToUpdates() {
    const dashboardName = this.getCurrentDashboard();
    const metrics = this.getTrackedMetrics();
    
    this.socket.emit('subscribe', {
      dashboards: [dashboardName],
      metrics: metrics
    });
  }

  handleMetricUpdate(data) {
    const { metric, value, timestamp } = data;
    
    // Update the UI element
    const element = document.querySelector(`[data-metric="${metric}"]`);
    if (element) {
      this.animateValueChange(element, value);
    }
    
    // Update any charts
    if (this.charts.has(metric)) {
      this.updateChart(metric, value, timestamp);
    }
    
    // Call any registered callbacks
    if (this.updateCallbacks.has(metric)) {
      this.updateCallbacks.get(metric)(value, timestamp);
    }
  }

  animateValueChange(element, newValue) {
    const oldValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, ''));
    const diff = newValue - oldValue;
    const isPositive = diff > 0;
    
    // Add animation class
    element.classList.add('value-updating');
    
    // Animate the number
    const duration = 500;
    const start = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = oldValue + (diff * this.easeOutQuad(progress));
      
      element.textContent = this.formatValue(current, element.dataset.format);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.classList.remove('value-updating');
        element.classList.add(isPositive ? 'value-increased' : 'value-decreased');
        setTimeout(() => {
          element.classList.remove('value-increased', 'value-decreased');
        }, 1000);
      }
    };
    
    animate();
  }

  easeOutQuad(t) {
    return t * (2 - t);
  }

  // Interactive Filters
  initializeFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'dashboard-filters';
    filterContainer.innerHTML = `
      <div class="filter-group">
        <label>Date Range</label>
        <select id="dateRangeFilter" class="filter-select">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month" selected>This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Department</label>
        <select id="departmentFilter" class="filter-select">
          <option value="all">All Departments</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="engineering">Engineering</option>
          <option value="support">Support</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Region</label>
        <select id="regionFilter" class="filter-select">
          <option value="all">All Regions</option>
          <option value="north-america">North America</option>
          <option value="europe">Europe</option>
          <option value="asia-pacific">Asia Pacific</option>
          <option value="latin-america">Latin America</option>
        </select>
      </div>
      <button class="filter-apply">Apply Filters</button>
      <button class="filter-reset">Reset</button>
    `;
    
    // Insert after header if exists
    const header = document.querySelector('.bcg-header');
    if (header) {
      header.insertAdjacentElement('afterend', filterContainer);
    }
  }

  // Dark Mode Theme
  initializeTheme() {
    // Add theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = 'Toggle dark mode';
    
    document.body.appendChild(themeToggle);
    
    // Apply saved theme
    if (this.theme === 'dark') {
      document.body.classList.add('dark-theme');
    }
    
    themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', this.theme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
    
    // Update chart colors
    this.updateChartThemes();
  }

  updateChartThemes() {
    const isDark = this.theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#1a1a1a';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    // Update existing charts
    this.charts.forEach((chart) => {
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.update();
    });
  }

  // Customizable Layouts
  initializeLayout() {
    const widgets = document.querySelectorAll('.dashboard-widget');
    if (widgets.length === 0) return;
    
    // Make widgets draggable
    widgets.forEach(widget => {
      widget.draggable = true;
      widget.addEventListener('dragstart', this.handleDragStart.bind(this));
      widget.addEventListener('dragover', this.handleDragOver.bind(this));
      widget.addEventListener('drop', this.handleDrop.bind(this));
      widget.addEventListener('dragend', this.handleDragEnd.bind(this));
    });
    
    // Load saved layout
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      this.applyLayout(JSON.parse(savedLayout));
    }
  }

  handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
    e.target.classList.add('dragging');
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    const draggedElement = document.querySelector('.dragging');
    if (draggedElement !== e.target) {
      const temp = document.createElement('div');
      e.target.parentNode.insertBefore(temp, e.target);
      draggedElement.parentNode.insertBefore(e.target, draggedElement);
      temp.parentNode.insertBefore(draggedElement, temp);
      temp.parentNode.removeChild(temp);
    }
    
    return false;
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.saveLayout();
  }

  saveLayout() {
    const widgets = document.querySelectorAll('.dashboard-widget');
    const layout = Array.from(widgets).map(widget => ({
      id: widget.id,
      position: Array.from(widget.parentNode.children).indexOf(widget)
    }));
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
  }

  // Event Listeners
  bindEventListeners() {
    // Filter apply
    document.querySelector('.filter-apply')?.addEventListener('click', () => {
      this.applyFilters();
    });
    
    // Filter reset
    document.querySelector('.filter-reset')?.addEventListener('click', () => {
      this.resetFilters();
    });
    
    // Drill-down on charts
    this.charts.forEach((chart, id) => {
      const canvas = document.getElementById(id);
      if (canvas) {
        canvas.addEventListener('click', (event) => {
          const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (points.length) {
            this.handleDrillDown(points[0], chart);
          }
        });
      }
    });
  }

  applyFilters() {
    this.filters = {
      dateRange: document.getElementById('dateRangeFilter').value,
      department: document.getElementById('departmentFilter').value,
      region: document.getElementById('regionFilter').value
    };
    
    // Show loading state
    this.showLoading();
    
    // Fetch filtered data
    fetch(`/api/v1/dashboard/data?${new URLSearchParams(this.filters)}`)
      .then(response => response.json())
      .then(data => {
        this.updateDashboardData(data);
        this.hideLoading();
      })
      .catch(error => {
        this.showError('Failed to apply filters');
        this.hideLoading();
      });
  }

  resetFilters() {
    document.getElementById('dateRangeFilter').value = 'month';
    document.getElementById('departmentFilter').value = 'all';
    document.getElementById('regionFilter').value = 'all';
    this.filters = {};
    this.applyFilters();
  }

  handleDrillDown(point, chart) {
    const datasetIndex = point.datasetIndex;
    const index = point.index;
    const label = chart.data.labels[index];
    const value = chart.data.datasets[datasetIndex].data[index];
    
    // Create drill-down modal
    const modal = document.createElement('div');
    modal.className = 'drill-down-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Detailed View: ${label}</h3>
        <div class="drill-down-data">
          <p>Loading detailed data...</p>
        </div>
        <button class="modal-close">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fetch detailed data
    fetch(`/api/v1/dashboard/drill-down?metric=${label}&value=${value}`)
      .then(response => response.json())
      .then(data => {
        this.renderDrillDownData(modal, data);
      });
  }

  // Utility Methods
  getCurrentDashboard() {
    const path = window.location.pathname;
    const match = path.match(/\/mockups\/\d+_(.+)\.html/);
    return match ? match[1].replace(/_/g, '-') : 'unknown';
  }

  getTrackedMetrics() {
    const elements = document.querySelectorAll('[data-metric]');
    return Array.from(elements).map(el => el.dataset.metric);
  }

  formatValue(value, format) {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(Math.round(value));
      default:
        return value.toFixed(2);
    }
  }

  updateConnectionStatus(status) {
    const indicator = document.querySelector('.connection-status');
    if (indicator) {
      indicator.className = `connection-status ${status}`;
      indicator.title = status === 'connected' ? 'Real-time updates active' : 'Reconnecting...';
    }
  }

  showLoading() {
    const loader = document.createElement('div');
    loader.className = 'dashboard-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  }

  hideLoading() {
    const loader = document.querySelector('.dashboard-loader');
    if (loader) {
      loader.remove();
    }
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const enhancer = new DashboardEnhancer();
  enhancer.initialize();
  
  // Export for global access
  window.dashboardEnhancer = enhancer;
});