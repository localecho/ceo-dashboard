# CEO Dashboard - Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### Step 1: Start the Dashboard
```bash
cd /Users/brighamhall/Dropbox/PYTHON/CEO-DASHBOARD
./start_dashboard.sh
```

### Step 2: Open Your Browser
Navigate to: http://localhost:8000

### Step 3: Start Using Your Dashboard
- **View Metrics**: See all your business metrics at a glance
- **Update Values**: Click any metric card to enter current values
- **Weekly Review**: Click "Start Weekly Review" to perform your weekly analysis
- **Track Bottlenecks**: The system automatically identifies your biggest constraints

## 📊 Key Features

### 1. One-Page Overview
Everything you need on a single screen:
- Overall health score
- Key metrics with status indicators
- Current bottleneck identification
- Performance trends
- Recommended actions

### 2. Manual Data Entry (By Design)
- Takes only 10 minutes per week
- Builds deeper understanding of your metrics
- No complex integrations needed
- You stay connected to your numbers

### 3. Smart Bottleneck Detection
The system automatically:
- Identifies metrics that are off-track
- Calculates impact on related metrics
- Prioritizes what needs attention first
- Suggests specific actions

### 4. Weekly Review Process
Every week:
1. Enter your metric values
2. Review week-over-week changes
3. Identify the primary bottleneck
4. Document key wins and challenges
5. Plan actions for next week

## 📈 Your Metrics

### Pre-Configured Metrics Include:

**Financial**
- Monthly Recurring Revenue (MRR)
- Cash Flow
- Burn Rate

**Sales**
- Leads Generated
- Conversion Rate
- New Customers

**Marketing**
- Website Traffic
- Content Published

**Operations**
- Project Completion Rate
- Team Productivity Score

**Customer**
- Customer Satisfaction (NPS)
- Support Response Time
- Churn Rate

## 🎯 Color-Coded Status System

- 🟢 **Green**: On track (90%+ of target)
- 🟡 **Yellow**: At risk (70-89% of target)
- 🔴 **Red**: Off track (<70% of target)
- ⚪ **Gray**: No data available

## 💡 Best Practices

### Daily (2 minutes)
- Glance at the dashboard
- Note any red metrics
- Check current bottleneck

### Weekly (10-15 minutes)
- Enter all metric values
- Complete weekly review
- Identify primary bottleneck
- Plan corrective actions

### Monthly (30 minutes)
- Review trends
- Adjust targets if needed
- Celebrate wins
- Plan strategic initiatives

## 🔧 Customization

### Adding New Metrics
Edit `src/models/metrics.py` and add to `METRIC_TEMPLATES`

### Changing Targets
Update targets through the database or wait for the UI feature (coming soon)

### Modifying Dashboard Layout
Edit `src/models/dashboard.py` to change widget positions

## 📱 Mobile Access
The dashboard is mobile-responsive. Access from any device at the same URL.

## 🆘 Troubleshooting

### Dashboard won't start
```bash
# Check Python version (needs 3.8+)
python3 --version

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Can't see data
1. Make sure you've entered values for the current week
2. Check that targets are set for your metrics
3. Try refreshing the browser (Ctrl+R)

### Database issues
```bash
# Reset database (WARNING: loses all data)
rm data/ceo_dashboard.db
python setup_database.py
```

## 📞 Getting Help
- Check the full documentation in `/docs`
- Review the README for detailed information
- Email support: support@ceodashboard.com

---

Remember: **The dashboard is a tool to help you make better decisions, not make decisions for you.** Use it to stay informed, identify problems early, and focus on what matters most for your business growth.