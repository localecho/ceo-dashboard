-- CEO Dashboard Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard layouts table
CREATE TABLE IF NOT EXISTS dashboard_layouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    layout_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metrics data table
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 4),
    metric_type VARCHAR(50),
    department VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    INDEX idx_metric_timestamp (timestamp),
    INDEX idx_metric_name (metric_name)
);

-- Revenue data table
CREATE TABLE IF NOT EXISTS revenue_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    revenue_type VARCHAR(50),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    customer_segment VARCHAR(50),
    product_line VARCHAR(100),
    region VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_revenue_date (date),
    INDEX idx_revenue_segment (customer_segment)
);

-- Customer data table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    segment VARCHAR(50),
    industry VARCHAR(100),
    mrr DECIMAL(12, 2),
    arr DECIMAL(15, 2),
    ltv DECIMAL(15, 2),
    nps_score INTEGER,
    health_score INTEGER,
    churn_risk VARCHAR(20),
    acquisition_date DATE,
    last_activity_date DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_segment (segment),
    INDEX idx_customer_health (health_score)
);

-- Product metrics table
CREATE TABLE IF NOT EXISTS product_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    feature_name VARCHAR(100),
    dau INTEGER,
    mau INTEGER,
    adoption_rate DECIMAL(5, 2),
    retention_rate DECIMAL(5, 2),
    avg_session_duration INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_date (date),
    INDEX idx_product_feature (feature_name)
);

-- Financial data table
CREATE TABLE IF NOT EXISTS financial_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    account_type VARCHAR(50),
    account_name VARCHAR(100),
    amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(50),
    department VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_financial_date (date),
    INDEX idx_financial_category (category)
);

-- Operational metrics table
CREATE TABLE IF NOT EXISTS operational_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    metric_name VARCHAR(100),
    metric_value DECIMAL(20, 4),
    unit VARCHAR(20),
    system_component VARCHAR(100),
    metadata JSONB,
    INDEX idx_ops_timestamp (timestamp),
    INDEX idx_ops_component (system_component)
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    insight_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    severity VARCHAR(20),
    metric_name VARCHAR(100),
    metric_value DECIMAL(20, 4),
    threshold_value DECIMAL(20, 4),
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_by INTEGER REFERENCES users(id),
    dismissed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_insights_created (created_at),
    INDEX idx_insights_type (insight_type)
);

-- Annotations table
CREATE TABLE IF NOT EXISTS annotations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    dashboard_id VARCHAR(50),
    widget_id VARCHAR(50),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_annotations_dashboard (dashboard_id)
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    permissions JSONB,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_created (created_at)
);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_layouts_updated_at BEFORE UPDATE ON dashboard_layouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();