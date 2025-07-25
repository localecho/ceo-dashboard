"""
Core metrics model for CEO Dashboard
Handles metric definitions, calculations, and status tracking
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, validator
import json


class MetricStatus(str, Enum):
    """Status indicators for metrics"""
    GREEN = "green"      # On track (90%+ of target)
    YELLOW = "yellow"    # At risk (70-89% of target)
    RED = "red"          # Off track (<70% of target)
    GRAY = "gray"        # No data


class MetricType(str, Enum):
    """Types of metrics"""
    LEADING = "leading"   # Predictive indicators
    LAGGING = "lagging"   # Result indicators
    FINANCIAL = "financial"
    OPERATIONAL = "operational"
    STRATEGIC = "strategic"


class MetricFrequency(str, Enum):
    """Update frequency for metrics"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


class MetricCategory(str, Enum):
    """Business categories for metrics"""
    SALES = "Sales"
    MARKETING = "Marketing"
    OPERATIONS = "Operations"
    FINANCE = "Finance"
    CUSTOMER = "Customer"
    TEAM = "Team"
    PRODUCT = "Product"
    STRATEGIC = "Strategic"


class MetricDefinition(BaseModel):
    """Definition of a business metric"""
    id: str
    name: str
    description: str
    category: MetricCategory
    type: MetricType
    frequency: MetricFrequency
    unit: str = ""  # e.g., "$", "%", "count"
    formula: Optional[str] = None
    data_source: Optional[str] = None
    is_higher_better: bool = True  # True if higher values are better
    decimal_places: int = 0
    
    # Relationships
    leading_metrics: List[str] = Field(default_factory=list)  # IDs of leading metrics
    lagging_metrics: List[str] = Field(default_factory=list)  # IDs of lagging metrics
    
    # Thresholds for status calculation
    green_threshold: float = 0.9   # 90% of target
    yellow_threshold: float = 0.7  # 70% of target
    
    class Config:
        use_enum_values = True


class MetricTarget(BaseModel):
    """Target values for a metric"""
    metric_id: str
    period_start: date
    period_end: date
    target_value: float
    stretch_goal: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class MetricValue(BaseModel):
    """Actual value entry for a metric"""
    metric_id: str
    value: float
    date: date
    week_number: Optional[int] = None
    month: Optional[int] = None
    year: int
    notes: Optional[str] = None
    entered_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    @validator('week_number', pre=True, always=True)
    def set_week_number(cls, v, values):
        if 'date' in values and v is None:
            return values['date'].isocalendar()[1]
        return v
    
    @validator('month', pre=True, always=True)
    def set_month(cls, v, values):
        if 'date' in values and v is None:
            return values['date'].month
        return v
    
    @validator('year', pre=True, always=True)
    def set_year(cls, v, values):
        if 'date' in values:
            return values['date'].year
        return v


class MetricAnalysis(BaseModel):
    """Analysis results for a metric"""
    metric_id: str
    current_value: float
    target_value: float
    previous_value: Optional[float] = None
    status: MetricStatus
    completion_percentage: float
    trend: str  # "up", "down", "stable"
    variance: float  # Difference from target
    variance_percentage: float
    bottleneck_score: float = 0.0  # 0-100, higher means more likely bottleneck
    action_required: bool = False
    recommended_actions: List[str] = Field(default_factory=list)
    analysis_date: datetime = Field(default_factory=datetime.now)


class MetricGroup(BaseModel):
    """Group of related metrics"""
    id: str
    name: str
    description: str
    metric_ids: List[str]
    weight: float = 1.0  # Importance weight for scoring
    created_at: datetime = Field(default_factory=datetime.now)


# Pre-defined metric templates
METRIC_TEMPLATES = {
    # Financial Metrics
    "mrr": MetricDefinition(
        id="mrr",
        name="Monthly Recurring Revenue",
        description="Total recurring revenue per month",
        category=MetricCategory.FINANCE,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.MONTHLY,
        unit="$",
        is_higher_better=True,
        decimal_places=2
    ),
    
    "cash_flow": MetricDefinition(
        id="cash_flow",
        name="Cash Flow",
        description="Net cash inflow/outflow per month",
        category=MetricCategory.FINANCE,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.MONTHLY,
        unit="$",
        is_higher_better=True,
        decimal_places=2
    ),
    
    "burn_rate": MetricDefinition(
        id="burn_rate",
        name="Burn Rate",
        description="Monthly cash burn rate",
        category=MetricCategory.FINANCE,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.MONTHLY,
        unit="$",
        is_higher_better=False,
        decimal_places=2
    ),
    
    # Sales Metrics
    "leads_generated": MetricDefinition(
        id="leads_generated",
        name="Leads Generated",
        description="Number of new leads per week",
        category=MetricCategory.SALES,
        type=MetricType.LEADING,
        frequency=MetricFrequency.WEEKLY,
        unit="count",
        is_higher_better=True,
        lagging_metrics=["new_customers"]
    ),
    
    "conversion_rate": MetricDefinition(
        id="conversion_rate",
        name="Conversion Rate",
        description="Percentage of leads converted to customers",
        category=MetricCategory.SALES,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.WEEKLY,
        unit="%",
        is_higher_better=True,
        decimal_places=1,
        formula="(new_customers / leads_generated) * 100"
    ),
    
    "new_customers": MetricDefinition(
        id="new_customers",
        name="New Customers",
        description="Number of new customers acquired",
        category=MetricCategory.SALES,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.WEEKLY,
        unit="count",
        is_higher_better=True,
        leading_metrics=["leads_generated"]
    ),
    
    # Marketing Metrics
    "website_traffic": MetricDefinition(
        id="website_traffic",
        name="Website Traffic",
        description="Weekly website visitors",
        category=MetricCategory.MARKETING,
        type=MetricType.LEADING,
        frequency=MetricFrequency.WEEKLY,
        unit="count",
        is_higher_better=True,
        lagging_metrics=["leads_generated"]
    ),
    
    "content_published": MetricDefinition(
        id="content_published",
        name="Content Published",
        description="Number of content pieces published",
        category=MetricCategory.MARKETING,
        type=MetricType.LEADING,
        frequency=MetricFrequency.WEEKLY,
        unit="count",
        is_higher_better=True,
        lagging_metrics=["website_traffic"]
    ),
    
    # Operations Metrics
    "project_completion": MetricDefinition(
        id="project_completion",
        name="Project Completion Rate",
        description="Percentage of projects completed on time",
        category=MetricCategory.OPERATIONS,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.WEEKLY,
        unit="%",
        is_higher_better=True,
        decimal_places=1
    ),
    
    "team_productivity": MetricDefinition(
        id="team_productivity",
        name="Team Productivity Score",
        description="Composite score of team output",
        category=MetricCategory.TEAM,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.WEEKLY,
        unit="score",
        is_higher_better=True,
        decimal_places=1
    ),
    
    # Customer Metrics
    "customer_satisfaction": MetricDefinition(
        id="customer_satisfaction",
        name="Customer Satisfaction (NPS)",
        description="Net Promoter Score from customer surveys",
        category=MetricCategory.CUSTOMER,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.MONTHLY,
        unit="score",
        is_higher_better=True,
        decimal_places=0
    ),
    
    "support_response_time": MetricDefinition(
        id="support_response_time",
        name="Support Response Time",
        description="Average time to first response (hours)",
        category=MetricCategory.CUSTOMER,
        type=MetricType.LEADING,
        frequency=MetricFrequency.WEEKLY,
        unit="hours",
        is_higher_better=False,
        decimal_places=1,
        lagging_metrics=["customer_satisfaction"]
    ),
    
    "churn_rate": MetricDefinition(
        id="churn_rate",
        name="Customer Churn Rate",
        description="Percentage of customers lost per month",
        category=MetricCategory.CUSTOMER,
        type=MetricType.LAGGING,
        frequency=MetricFrequency.MONTHLY,
        unit="%",
        is_higher_better=False,
        decimal_places=1
    )
}


class MetricsCalculator:
    """Calculate metric values and relationships"""
    
    @staticmethod
    def calculate_status(actual: float, target: float, metric_def: MetricDefinition) -> MetricStatus:
        """Calculate metric status based on actual vs target"""
        if target == 0:
            return MetricStatus.GRAY
        
        completion_ratio = actual / target
        
        # Reverse logic for metrics where lower is better
        if not metric_def.is_higher_better:
            completion_ratio = 2 - completion_ratio  # Invert the ratio
        
        if completion_ratio >= metric_def.green_threshold:
            return MetricStatus.GREEN
        elif completion_ratio >= metric_def.yellow_threshold:
            return MetricStatus.YELLOW
        else:
            return MetricStatus.RED
    
    @staticmethod
    def calculate_trend(current: float, previous: float) -> str:
        """Calculate trend direction"""
        if previous == 0:
            return "stable"
        
        change_percent = ((current - previous) / abs(previous)) * 100
        
        if change_percent > 5:
            return "up"
        elif change_percent < -5:
            return "down"
        else:
            return "stable"
    
    @staticmethod
    def calculate_bottleneck_score(
        metric_analysis: MetricAnalysis,
        related_metrics: List[MetricAnalysis]
    ) -> float:
        """
        Calculate bottleneck score (0-100)
        Higher score indicates metric is more likely to be a bottleneck
        """
        score = 0.0
        
        # Factor 1: How far off target (40 points max)
        if metric_analysis.status == MetricStatus.RED:
            score += 40
        elif metric_analysis.status == MetricStatus.YELLOW:
            score += 20
        
        # Factor 2: Negative trend (20 points max)
        if metric_analysis.trend == "down":
            score += 20
        
        # Factor 3: Impact on related metrics (40 points max)
        if related_metrics:
            impacted_count = sum(1 for m in related_metrics if m.status in [MetricStatus.RED, MetricStatus.YELLOW])
            impact_ratio = impacted_count / len(related_metrics)
            score += impact_ratio * 40
        
        return min(score, 100.0)


def get_metric_definition(metric_id: str) -> Optional[MetricDefinition]:
    """Get a metric definition by ID"""
    return METRIC_TEMPLATES.get(metric_id)


def get_metrics_by_category(category: MetricCategory) -> List[MetricDefinition]:
    """Get all metrics in a category"""
    return [m for m in METRIC_TEMPLATES.values() if m.category == category]


def get_leading_metrics() -> List[MetricDefinition]:
    """Get all leading indicator metrics"""
    return [m for m in METRIC_TEMPLATES.values() if m.type == MetricType.LEADING]


def get_lagging_metrics() -> List[MetricDefinition]:
    """Get all lagging indicator metrics"""
    return [m for m in METRIC_TEMPLATES.values() if m.type == MetricType.LAGGING]