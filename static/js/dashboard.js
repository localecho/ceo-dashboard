// CEO Dashboard JavaScript

// Global variables
let dashboardData = null;
let currentWeek = null;
let currentYear = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    
    // Get current week/year
    const today = new Date();
    currentWeek = getWeekNumber(today);
    currentYear = today.getFullYear();
    
    // Populate week selector
    populateWeekSelector();
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up auto-refresh every 5 minutes
    setInterval(loadDashboardData, 300000);
});

// Initialize dashboard
function initializeDashboard() {
    // Dashboard initialization
}

// Set up event listeners
function setupEventListeners() {
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Start review button
    document.getElementById('start-review').addEventListener('click', startWeeklyReview);
    
    // Week selector
    document.getElementById('week-selector').addEventListener('change', function(e) {
        const [year, week] = e.target.value.split('-W');
        loadWeeklyReview(parseInt(year), parseInt(week));
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportReport);
    
    // Metric input form
    document.getElementById('metric-input-form').addEventListener('submit', handleMetricUpdate);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard-data');
        dashboardData = await response.json();
        
        // Update UI components
        updateHealthScore(dashboardData.health_score);
        updateMetricsGrid(dashboardData.metrics);
        updateBottleneck(dashboardData.bottlenecks);
        updateCategoryChart(dashboardData.categories);
        updateTrendChart(dashboardData.metrics, dashboardData.historical);
        updateActionItems(dashboardData.bottlenecks, dashboardData.metrics);
        updateLastUpdated();
        
    } catch (error) {
        showError('Failed to load dashboard data');
    }
}

// Update health score
function updateHealthScore(score) {
    const scoreElement = document.querySelector('.score-value');
    scoreElement.textContent = score.toFixed(1);
    
    // Color based on score
    if (score >= 80) {
        scoreElement.style.color = 'var(--success-color)';
    } else if (score >= 60) {
        scoreElement.style.color = 'var(--warning-color)';
    } else {
        scoreElement.style.color = 'var(--danger-color)';
    }
}

// Update metrics grid
function updateMetricsGrid(metrics) {
    const grid = document.getElementById('metrics-grid');
    grid.innerHTML = '';
    
    metrics.forEach(metric => {
        const card = createMetricCard(metric);
        grid.appendChild(card);
    });
}

// Create metric card
function createMetricCard(metric) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.onclick = () => openMetricInput(metric);
    
    const header = document.createElement('div');
    header.className = 'metric-header';
    
    const name = document.createElement('div');
    name.className = 'metric-name';
    name.textContent = metric.name;
    
    const status = document.createElement('div');
    status.className = `metric-status status-${metric.status}`;
    
    header.appendChild(name);
    header.appendChild(status);
    
    const value = document.createElement('div');
    value.className = 'metric-value';
    if (metric.current_value !== null) {
        value.textContent = formatValue(metric.current_value, metric.unit, metric.decimal_places);
    } else {
        value.textContent = '--';
        value.style.color = 'var(--text-secondary)';
    }
    
    const target = document.createElement('div');
    target.className = 'metric-target';
    if (metric.target_value !== null) {
        target.textContent = `Target: ${formatValue(metric.target_value, metric.unit, metric.decimal_places)}`;
    } else {
        target.textContent = 'No target set';
    }
    
    // Calculate trend if we have previous value
    const trend = document.createElement('div');
    trend.className = 'metric-trend';
    if (metric.current_value && metric.previous_value) {
        const change = ((metric.current_value - metric.previous_value) / metric.previous_value) * 100;
        if (change > 5) {
            trend.className += ' trend-up';
            trend.textContent = `↑ ${Math.abs(change).toFixed(1)}%`;
        } else if (change < -5) {
            trend.className += ' trend-down';
            trend.textContent = `↓ ${Math.abs(change).toFixed(1)}%`;
        } else {
            trend.className += ' trend-stable';
            trend.textContent = `→ Stable`;
        }
    }
    
    card.appendChild(header);
    card.appendChild(value);
    card.appendChild(target);
    if (trend.textContent) {
        card.appendChild(trend);
    }
    
    return card;
}

// Update bottleneck display
function updateBottleneck(bottlenecks) {
    const content = document.getElementById('bottleneck-content');
    
    if (bottlenecks.length === 0) {
        content.innerHTML = '<p style="color: var(--success-color);">✅ No critical bottlenecks detected!</p>';
        return;
    }
    
    const topBottleneck = bottlenecks[0];
    content.innerHTML = `
        <div class="bottleneck-metric">${topBottleneck.metric_name}</div>
        <div class="bottleneck-score">Bottleneck Score: ${topBottleneck.score.toFixed(0)}/100</div>
        <div style="margin-top: 10px; font-size: 14px;">
            Status: <span class="status-${topBottleneck.status}" style="text-transform: uppercase; font-weight: 600;">${topBottleneck.status}</span>
        </div>
    `;
}

// Update category performance chart
function updateCategoryChart(categories) {
    const data = {
        type: 'scatterpolar',
        r: [],
        theta: [],
        fill: 'toself',
        name: 'Performance'
    };
    
    for (const [category, info] of Object.entries(categories)) {
        data.r.push(info.score);
        data.theta.push(category);
    }
    
    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100]
            }
        },
        showlegend: false,
        height: 300,
        margin: { t: 20, b: 20 }
    };
    
    Plotly.newPlot('category-chart', [data], layout, {responsive: true});
}

// Update trend chart
function updateTrendChart(metrics, historical) {
    const traces = [];
    
    // Select key metrics for trend display
    const keyMetrics = ['mrr', 'new_customers', 'website_traffic', 'team_productivity'];
    
    keyMetrics.forEach(metricId => {
        const metric = metrics.find(m => m.id === metricId);
        if (metric && historical[metricId]) {
            traces.push({
                x: historical[metricId].map(h => h.date),
                y: historical[metricId].map(h => h.value),
                type: 'scatter',
                mode: 'lines+markers',
                name: metric.name,
                line: { width: 2 }
            });
        }
    });
    
    const layout = {
        showlegend: true,
        height: 300,
        margin: { t: 20 },
        xaxis: { title: 'Date' },
        yaxis: { title: 'Value' }
    };
    
    Plotly.newPlot('trend-chart', traces, layout, {responsive: true});
}

// Update action items
function updateActionItems(bottlenecks, metrics) {
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = '';
    
    // Generate actions based on bottlenecks
    bottlenecks.forEach((bottleneck, index) => {
        const metric = metrics.find(m => m.id === bottleneck.metric_id);
        if (!metric) return;
        
        const priority = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
        const action = createActionItem(
            `Improve ${metric.name}`,
            `Focus on bringing ${metric.name} back to target. Current status: ${metric.status}`,
            priority
        );
        actionsList.appendChild(action);
    });
    
    // Add general actions if no bottlenecks
    if (bottlenecks.length === 0) {
        const action = createActionItem(
            'Maintain Performance',
            'All metrics are on track. Focus on maintaining current performance levels.',
            'low'
        );
        actionsList.appendChild(action);
    }
}

// Create action item element
function createActionItem(title, description, priority) {
    const item = document.createElement('div');
    item.className = `action-item action-priority-${priority}`;
    
    item.innerHTML = `
        <div class="action-title">${title}</div>
        <div class="action-description">${description}</div>
    `;
    
    return item;
}

// Format value based on unit
function formatValue(value, unit, decimals = 0) {
    if (unit === '$') {
        return '$' + value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    } else if (unit === '%') {
        return value.toFixed(decimals) + '%';
    } else {
        return value.toFixed(decimals);
    }
}

// Open metric input modal
function openMetricInput(metric) {
    const modal = document.getElementById('metric-input-modal');
    document.getElementById('metric-id').value = metric.id;
    document.getElementById('metric-name').textContent = metric.name;
    document.getElementById('metric-unit').textContent = metric.unit || '';
    document.getElementById('metric-value').value = '';
    document.getElementById('metric-notes').value = '';
    
    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('metric-input-modal').style.display = 'none';
}

// Handle metric update
async function handleMetricUpdate(e) {
    e.preventDefault();
    
    const metricId = document.getElementById('metric-id').value;
    const value = parseFloat(document.getElementById('metric-value').value);
    const notes = document.getElementById('metric-notes').value;
    
    try {
        const response = await fetch(`/api/metrics/${metricId}/values`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value, notes })
        });
        
        if (response.ok) {
            closeModal();
            loadDashboardData(); // Reload data
            showSuccess('Metric updated successfully');
        } else {
            throw new Error('Failed to update metric');
        }
    } catch (error) {
        showError('Failed to update metric');
    }
}

// Start weekly review
function startWeeklyReview() {
    document.getElementById('review-content').style.display = 'block';
    loadWeeklyReview(currentYear, currentWeek);
}

// Load weekly review data
async function loadWeeklyReview(year, week) {
    try {
        const response = await fetch(`/api/weekly-review/${year}/${week}`);
        const data = await response.json();
        
        displayWeeklyReview(data);
    } catch (error) {
        showError('Failed to load weekly review');
    }
}

// Display weekly review
function displayWeeklyReview(reviewData) {
    const content = document.getElementById('review-content');
    
    let html = `
        <h3>Week ${reviewData.week}, ${reviewData.year}</h3>
        <p>${reviewData.start_date} to ${reviewData.end_date}</p>
        
        <h4>Metrics to Review:</h4>
        <div class="review-metrics">
    `;
    
    reviewData.metrics.forEach(metric => {
        const needsInput = metric.needs_input ? 'style="background-color: #fef3c7;"' : '';
        html += `
            <div class="review-metric" ${needsInput}>
                <strong>${metric.name}</strong>: 
                ${metric.current_value !== null ? formatValue(metric.current_value, metric.unit) : 'No data'} 
                (Target: ${metric.target_value !== null ? formatValue(metric.target_value, metric.unit) : 'N/A'})
                ${metric.needs_input ? '<button onclick="openMetricInput(' + JSON.stringify(metric) + ')">Enter Value</button>' : ''}
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div class="review-form">
            <h4>Review Summary:</h4>
            <label>Primary Bottleneck:</label>
            <select id="review-bottleneck">
                ${reviewData.metrics.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
            </select>
            
            <label>Review Notes:</label>
            <textarea id="review-notes" rows="4" style="width: 100%;"></textarea>
            
            <button class="btn btn-primary" onclick="completeWeeklyReview(${reviewData.year}, ${reviewData.week})">
                Complete Review
            </button>
        </div>
    `;
    
    content.innerHTML = html;
}

// Complete weekly review
async function completeWeeklyReview(year, week) {
    const bottleneck = document.getElementById('review-bottleneck').value;
    const notes = document.getElementById('review-notes').value;
    
    try {
        const response = await fetch(`/api/weekly-review/${year}/${week}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                primary_bottleneck: bottleneck,
                review_notes: notes
            })
        });
        
        if (response.ok) {
            showSuccess('Weekly review completed successfully');
            document.getElementById('review-content').style.display = 'none';
            loadDashboardData();
        } else {
            throw new Error('Failed to complete review');
        }
    } catch (error) {
        showError('Failed to complete review');
    }
}

// Populate week selector
function populateWeekSelector() {
    const selector = document.getElementById('week-selector');
    const today = new Date();
    
    // Add last 12 weeks
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7));
        const week = getWeekNumber(date);
        const year = date.getFullYear();
        
        const option = document.createElement('option');
        option.value = `${year}-W${week}`;
        option.textContent = `Week ${week}, ${year}`;
        
        if (i === 0) {
            option.selected = true;
        }
        
        selector.appendChild(option);
    }
}

// Get week number from date
function getWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// Export report
async function exportReport() {
    try {
        // Show options to user
        const exportType = confirm('Click OK for Executive Report (Markdown)\nClick Cancel for Data Export (CSV)');
        
        const endpoint = exportType ? '/api/export/report' : '/api/export/csv';
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.status === 'success') {
            showSuccess(`Export completed! File saved to: ${data.file}`);
            
            // Optionally download the snapshot
            if (!exportType) {
                // For CSV, also offer to download current snapshot
                const downloadSnapshot = confirm('Also download current dashboard snapshot (JSON)?');
                if (downloadSnapshot) {
                    const snapshotResponse = await fetch('/api/export/snapshot');
                    const snapshot = await snapshotResponse.json();
                    
                    // Create download link
                    const dataStr = JSON.stringify(snapshot, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    
                    const exportFileDefaultName = `dashboard_snapshot_${new Date().toISOString().slice(0,10)}.json`;
                    
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                }
            }
        } else {
            showError('Export failed');
        }
    } catch (error) {
        showError('Export failed: ' + error.message);
    }
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleString();
}

// Show success message
function showSuccess(message) {
    alert('Success: ' + message);
}

// Show error message
function showError(message) {
    alert('Error: ' + message);
}

// Show info message
function showInfo(message) {
    alert('Info: ' + message);
}

// Handle window click for modal
window.onclick = function(event) {
    const modal = document.getElementById('metric-input-modal');
    if (event.target === modal) {
        closeModal();
    }
}