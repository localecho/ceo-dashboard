"""
Dashboard model for CEO Dashboard
Manages dashboard views, layouts, and data aggregation
"""

from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any, Tuple
from enum import Enum
from pydantic import BaseModel, Field
import json

from .metrics import (
    MetricDefinition, MetricValue, MetricTarget, MetricAnalysis,
    MetricStatus, MetricCategory, MetricsCalculator, METRIC_TEMPLATES
)


class DashboardView(str, Enum):
    """Available dashboard views"""
    EXECUTIVE = "executive"      # High-level summary
    DETAILED = "detailed"        # All metrics with details
    WEEKLY = "weekly"           # Weekly review focus
    QUARTERLY = "quarterly"     # Quarterly strategic view
    CUSTOM = "custom"           # User-defined view


class TimeRange(str, Enum):
    """Time ranges for dashboard data"""
    CURRENT_WEEK = "current_week"
    LAST_WEEK = "last_week"
    CURRENT_MONTH = "current_month"
    LAST_MONTH = "last_month"
    CURRENT_QUARTER = "current_quarter"
    LAST_QUARTER = "last_quarter"
    CURRENT_YEAR = "current_year"
    CUSTOM = "custom"


class DashboardWidget(BaseModel):
    """Individual widget on the dashboard"""
    id: str
    type: str  # "metric", "chart", "table", "alert", "text"
    title: str
    metric_ids: List[str] = Field(default_factory=list)
    position: Dict[str, int]  # {"row": 1, "col": 1, "width": 4, "height": 2}
    config: Dict[str, Any] = Field(default_factory=dict)
    refresh_interval: int = 300  # seconds


class DashboardLayout(BaseModel):
    """Layout configuration for a dashboard view"""
    view: DashboardView
    name: str
    description: str
    widgets: List[DashboardWidget]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class DashboardData(BaseModel):
    """Aggregated data for dashboard display"""
    timestamp: datetime = Field(default_factory=datetime.now)
    view: DashboardView
    time_range: TimeRange
    metrics_summary: Dict[str, MetricAnalysis]
    category_summary: Dict[MetricCategory, Dict[str, Any]]
    bottlenecks: List[Tuple[str, float]]  # [(metric_id, score)]
    alerts: List[Dict[str, Any]]
    overall_health_score: float
    week_over_week_change: float
    key_insights: List[str]


class WeeklyReviewData(BaseModel):
    """Data structure for weekly review"""
    week_number: int
    year: int
    start_date: date
    end_date: date
    metrics_data: Dict[str, Dict[str, Any]]  # metric_id -> data
    bottleneck: Optional[str] = None  # Primary bottleneck metric_id
    actions_taken: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    completed: bool = False
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None


class QuarterlyReviewData(BaseModel):
    """Data structure for quarterly review"""
    quarter: int
    year: int
    start_date: date
    end_date: date
    monthly_summaries: List[Dict[str, Any]]
    quarterly_goals: Dict[str, float]  # metric_id -> target
    goal_achievement: Dict[str, float]  # metric_id -> percentage
    strategic_initiatives: List[Dict[str, Any]]
    key_decisions: List[str]
    next_quarter_focus: List[str]


# Default dashboard layouts
DEFAULT_LAYOUTS = {
    DashboardView.EXECUTIVE: DashboardLayout(
        view=DashboardView.EXECUTIVE,
        name="Executive Summary",
        description="High-level overview of business health",
        widgets=[
            DashboardWidget(
                id="health_score",
                type="metric",
                title="Overall Health Score",
                position={"row": 0, "col": 0, "width": 3, "height": 2},
                config={"display": "gauge", "max": 100}
            ),
            DashboardWidget(
                id="revenue_summary",
                type="chart",
                title="Revenue Trend",
                metric_ids=["mrr", "cash_flow"],
                position={"row": 0, "col": 3, "width": 6, "height": 2},
                config={"chart_type": "line", "period": "last_6_months"}
            ),
            DashboardWidget(
                id="bottleneck_alert",
                type="alert",
                title="Current Bottleneck",
                position={"row": 0, "col": 9, "width": 3, "height": 2},
                config={"severity": "high"}
            ),
            DashboardWidget(
                id="metrics_grid",
                type="table",
                title="Key Metrics Status",
                metric_ids=["mrr", "new_customers", "churn_rate", "team_productivity"],
                position={"row": 2, "col": 0, "width": 12, "height": 3},
                config={"show_trend": True, "show_target": True}
            ),
            DashboardWidget(
                id="category_breakdown",
                type="chart",
                title="Performance by Category",
                position={"row": 5, "col": 0, "width": 6, "height": 3},
                config={"chart_type": "radar"}
            ),
            DashboardWidget(
                id="action_items",
                type="table",
                title="Recommended Actions",
                position={"row": 5, "col": 6, "width": 6, "height": 3},
                config={"max_items": 5, "priority_only": True}
            )
        ]
    ),
    
    DashboardView.WEEKLY: DashboardLayout(
        view=DashboardView.WEEKLY,
        name="Weekly Review",
        description="Focused view for weekly metric updates and review",
        widgets=[
            DashboardWidget(
                id="week_summary",
                type="text",
                title="Week Overview",
                position={"row": 0, "col": 0, "width": 12, "height": 1},
                config={"template": "week_summary"}
            ),
            DashboardWidget(
                id="metrics_input",
                type="table",
                title="Enter This Week's Metrics",
                position={"row": 1, "col": 0, "width": 6, "height": 4},
                config={"editable": True, "show_last_week": True}
            ),
            DashboardWidget(
                id="week_comparison",
                type="chart",
                title="Week-over-Week Changes",
                position={"row": 1, "col": 6, "width": 6, "height": 4},
                config={"chart_type": "waterfall"}
            ),
            DashboardWidget(
                id="bottleneck_analysis",
                type="table",
                title="Bottleneck Analysis",
                position={"row": 5, "col": 0, "width": 12, "height": 2},
                config={"show_scores": True, "highlight_top": True}
            ),
            DashboardWidget(
                id="actions_planning",
                type="table",
                title="Action Planning",
                position={"row": 7, "col": 0, "width": 12, "height": 2},
                config={"template": "gap_management"}
            )
        ]
    )
}


class DashboardCalculator:
    """Calculate dashboard metrics and scores"""
    
    @staticmethod
    def calculate_health_score(metrics_analyses: List[MetricAnalysis]) -> float:
        """
        Calculate overall business health score (0-100)
        Weighted average based on metric status and importance
        """
        if not metrics_analyses:
            return 0.0
        
        total_weight = 0.0
        weighted_sum = 0.0
        
        status_scores = {
            MetricStatus.GREEN: 100,
            MetricStatus.YELLOW: 70,
            MetricStatus.RED: 30,
            MetricStatus.GRAY: 50
        }
        
        for analysis in metrics_analyses:
            # Get metric definition for weight
            metric_def = METRIC_TEMPLATES.get(analysis.metric_id)
            if not metric_def:
                continue
            
            # Financial metrics have higher weight
            weight = 2.0 if metric_def.category == MetricCategory.FINANCE else 1.0
            
            score = status_scores.get(analysis.status, 50)
            weighted_sum += score * weight
            total_weight += weight
        
        return round(weighted_sum / total_weight, 1) if total_weight > 0 else 0.0
    
    @staticmethod
    def calculate_category_performance(
        metrics_analyses: List[MetricAnalysis]
    ) -> Dict[MetricCategory, Dict[str, Any]]:
        """Calculate performance by category"""
        category_data = {}
        
        for category in MetricCategory:
            category_metrics = [
                ma for ma in metrics_analyses
                if METRIC_TEMPLATES.get(ma.metric_id, {}).get('category') == category
            ]
            
            if not category_metrics:
                continue
            
            green_count = sum(1 for m in category_metrics if m.status == MetricStatus.GREEN)
            yellow_count = sum(1 for m in category_metrics if m.status == MetricStatus.YELLOW)
            red_count = sum(1 for m in category_metrics if m.status == MetricStatus.RED)
            
            category_data[category] = {
                "total_metrics": len(category_metrics),
                "green": green_count,
                "yellow": yellow_count,
                "red": red_count,
                "score": DashboardCalculator.calculate_health_score(category_metrics),
                "top_issue": next(
                    (m.metric_id for m in category_metrics if m.status == MetricStatus.RED),
                    None
                )
            }
        
        return category_data
    
    @staticmethod
    def identify_bottlenecks(
        metrics_analyses: List[MetricAnalysis],
        top_n: int = 3
    ) -> List[Tuple[str, float]]:
        """
        Identify top bottlenecks based on analysis
        Returns list of (metric_id, bottleneck_score) tuples
        """
        bottleneck_scores = []
        
        for analysis in metrics_analyses:
            if analysis.status in [MetricStatus.RED, MetricStatus.YELLOW]:
                # Get related metrics
                metric_def = METRIC_TEMPLATES.get(analysis.metric_id)
                if not metric_def:
                    continue
                
                # Find metrics that depend on this one
                related_analyses = [
                    ma for ma in metrics_analyses
                    if ma.metric_id in metric_def.lagging_metrics
                ]
                
                score = MetricsCalculator.calculate_bottleneck_score(
                    analysis, related_analyses
                )
                
                bottleneck_scores.append((analysis.metric_id, score))
        
        # Sort by score descending and return top N
        bottleneck_scores.sort(key=lambda x: x[1], reverse=True)
        return bottleneck_scores[:top_n]
    
    @staticmethod
    def generate_insights(
        current_data: Dict[str, MetricAnalysis],
        previous_data: Optional[Dict[str, MetricAnalysis]] = None
    ) -> List[str]:
        """Generate actionable insights from dashboard data"""
        insights = []
        
        # Insight 1: Biggest improvements
        if previous_data:
            improvements = []
            for metric_id, current in current_data.items():
                if metric_id in previous_data:
                    prev = previous_data[metric_id]
                    if current.completion_percentage > prev.completion_percentage + 10:
                        improvements.append((
                            metric_id,
                            current.completion_percentage - prev.completion_percentage
                        ))
            
            if improvements:
                best = max(improvements, key=lambda x: x[1])
                metric_name = METRIC_TEMPLATES[best[0]].name
                insights.append(
                    f"🚀 {metric_name} improved by {best[1]:.1f}% this week"
                )
        
        # Insight 2: Critical alerts
        red_metrics = [
            (mid, ma) for mid, ma in current_data.items()
            if ma.status == MetricStatus.RED
        ]
        if red_metrics:
            worst = min(red_metrics, key=lambda x: x[1].completion_percentage)
            metric_name = METRIC_TEMPLATES[worst[0]].name
            insights.append(
                f"⚠️ {metric_name} needs immediate attention ({worst[1].completion_percentage:.0f}% of target)"
            )
        
        # Insight 3: Trending concerns
        declining = [
            mid for mid, ma in current_data.items()
            if ma.trend == "down" and ma.status != MetricStatus.GREEN
        ]
        if declining:
            insights.append(
                f"📉 {len(declining)} metrics showing declining trend"
            )
        
        # Insight 4: Success patterns
        green_count = sum(1 for ma in current_data.values() if ma.status == MetricStatus.GREEN)
        total_count = len(current_data)
        if green_count / total_count > 0.8:
            insights.append(
                f"✅ Strong performance: {green_count}/{total_count} metrics on track"
            )
        
        return insights
    
    @staticmethod
    def get_time_range_dates(time_range: TimeRange) -> Tuple[date, date]:
        """Get start and end dates for a time range"""
        today = date.today()
        
        if time_range == TimeRange.CURRENT_WEEK:
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
        elif time_range == TimeRange.LAST_WEEK:
            start = today - timedelta(days=today.weekday() + 7)
            end = start + timedelta(days=6)
        elif time_range == TimeRange.CURRENT_MONTH:
            start = date(today.year, today.month, 1)
            if today.month == 12:
                end = date(today.year + 1, 1, 1) - timedelta(days=1)
            else:
                end = date(today.year, today.month + 1, 1) - timedelta(days=1)
        elif time_range == TimeRange.LAST_MONTH:
            if today.month == 1:
                start = date(today.year - 1, 12, 1)
                end = date(today.year, 1, 1) - timedelta(days=1)
            else:
                start = date(today.year, today.month - 1, 1)
                end = date(today.year, today.month, 1) - timedelta(days=1)
        elif time_range == TimeRange.CURRENT_QUARTER:
            quarter = (today.month - 1) // 3
            start = date(today.year, quarter * 3 + 1, 1)
            if quarter == 3:
                end = date(today.year + 1, 1, 1) - timedelta(days=1)
            else:
                end = date(today.year, (quarter + 1) * 3 + 1, 1) - timedelta(days=1)
        elif time_range == TimeRange.CURRENT_YEAR:
            start = date(today.year, 1, 1)
            end = date(today.year, 12, 31)
        else:
            start = today
            end = today
        
        return start, end