"""
Review system model for CEO Dashboard
Handles weekly reviews, quarterly reviews, and gap management
"""

from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
import json

from .metrics import MetricStatus, MetricAnalysis


class ActionPriority(str, Enum):
    """Priority levels for actions"""
    CRITICAL = "critical"   # Must do this week
    HIGH = "high"          # Should do this week
    MEDIUM = "medium"      # Plan for next week
    LOW = "low"            # Nice to have


class ActionStatus(str, Enum):
    """Status of action items"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DEFERRED = "deferred"


class GapType(str, Enum):
    """Types of gaps in performance"""
    EXECUTION = "execution"          # Plan was good, execution failed
    PLANNING = "planning"            # Plan was insufficient
    EXTERNAL = "external"            # External factors
    RESOURCE = "resource"            # Lack of resources
    PROCESS = "process"              # Process issues
    KNOWLEDGE = "knowledge"          # Lack of knowledge/skills


class ActionItem(BaseModel):
    """Action item from reviews"""
    id: str
    title: str
    description: str
    metric_id: Optional[str] = None
    priority: ActionPriority
    status: ActionStatus = ActionStatus.NOT_STARTED
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    notes: List[str] = Field(default_factory=list)
    
    def add_note(self, note: str):
        """Add a note to the action item"""
        self.notes.append(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {note}")
        self.updated_at = datetime.now()


class GapAnalysis(BaseModel):
    """Analysis of performance gaps"""
    metric_id: str
    gap_type: GapType
    root_cause: str
    impact_assessment: str
    recommended_actions: List[str]
    resources_needed: List[str] = Field(default_factory=list)
    estimated_effort: str  # "Low", "Medium", "High"
    expected_improvement: float  # Percentage
    analysis_date: datetime = Field(default_factory=datetime.now)


class WeeklyReview(BaseModel):
    """Complete weekly review record"""
    id: str
    week_number: int
    year: int
    start_date: date
    end_date: date
    
    # Metrics data
    metrics_entered: Dict[str, float]  # metric_id -> value
    metrics_analysis: Dict[str, MetricAnalysis]  # metric_id -> analysis
    
    # Bottleneck identification
    primary_bottleneck: Optional[str] = None
    bottleneck_score: Optional[float] = None
    bottleneck_analysis: Optional[str] = None
    
    # Gap analysis
    gaps_identified: List[GapAnalysis] = Field(default_factory=list)
    
    # Actions
    actions_from_gaps: List[ActionItem] = Field(default_factory=list)
    actions_carried_forward: List[str] = Field(default_factory=list)  # Action IDs
    
    # Review metadata
    review_notes: Optional[str] = None
    key_wins: List[str] = Field(default_factory=list)
    key_challenges: List[str] = Field(default_factory=list)
    
    # Status
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    time_spent_minutes: Optional[int] = None
    
    @property
    def is_complete(self) -> bool:
        """Check if review is complete"""
        return self.completed_at is not None
    
    def complete_review(self, reviewed_by: str):
        """Mark review as complete"""
        self.completed_at = datetime.now()
        self.reviewed_by = reviewed_by
        if self.started_at:
            self.time_spent_minutes = int(
                (self.completed_at - self.started_at).total_seconds() / 60
            )


class QuarterlyReview(BaseModel):
    """Complete quarterly review record"""
    id: str
    quarter: int  # 1-4
    year: int
    start_date: date
    end_date: date
    
    # Aggregated metrics
    monthly_performance: Dict[int, Dict[str, Dict[str, Any]]]  # month -> metric_id -> data
    quarterly_averages: Dict[str, float]  # metric_id -> average
    
    # Goals and achievement
    quarterly_targets: Dict[str, float]  # metric_id -> target
    achievement_rates: Dict[str, float]  # metric_id -> achievement %
    
    # Strategic review
    strategic_priorities: List[Dict[str, Any]]
    priority_progress: Dict[str, str]  # priority_id -> status
    
    # Major decisions and changes
    key_decisions: List[Dict[str, Any]]
    process_improvements: List[str]
    
    # Learning and insights
    lessons_learned: List[str]
    success_factors: List[str]
    failure_factors: List[str]
    
    # Next quarter planning
    next_quarter_focus: List[str]
    next_quarter_targets: Dict[str, float]  # metric_id -> target
    resource_allocation: Dict[str, float]  # area -> percentage
    
    # Review metadata
    review_notes: Optional[str] = None
    participants: List[str] = Field(default_factory=list)
    
    # Status
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    
    @property
    def is_complete(self) -> bool:
        """Check if review is complete"""
        return self.completed_at is not None and self.approved_by is not None


# Gap Management Playbook Templates
GAP_PLAYBOOK = {
    GapType.EXECUTION: {
        "name": "Execution Gap",
        "description": "The plan was sound but execution fell short",
        "diagnostic_questions": [
            "Were the responsible parties clear on expectations?",
            "Did they have the necessary resources?",
            "Were there competing priorities?",
            "Was progress tracked frequently enough?",
            "Were there skill/knowledge gaps?"
        ],
        "common_solutions": [
            "Increase check-in frequency",
            "Clarify responsibilities and expectations",
            "Remove competing priorities",
            "Provide additional training or support",
            "Break down into smaller, manageable tasks"
        ],
        "prevention_measures": [
            "Daily stand-ups for critical initiatives",
            "Clear RACI matrix for all projects",
            "Resource allocation review",
            "Skills assessment and training plan"
        ]
    },
    
    GapType.PLANNING: {
        "name": "Planning Gap",
        "description": "The plan itself was insufficient or unrealistic",
        "diagnostic_questions": [
            "Were targets based on historical data?",
            "Did we account for all dependencies?",
            "Were assumptions validated?",
            "Was the timeline realistic?",
            "Did we have input from all stakeholders?"
        ],
        "common_solutions": [
            "Revise targets based on actual capacity",
            "Conduct thorough dependency analysis",
            "Add buffer time for unknowns",
            "Get buy-in from all involved parties",
            "Use historical data for better estimates"
        ],
        "prevention_measures": [
            "Planning templates with checklist",
            "Historical performance database",
            "Stakeholder sign-off process",
            "Post-mortem on planning misses"
        ]
    },
    
    GapType.EXTERNAL: {
        "name": "External Factors",
        "description": "Outside forces impacted performance",
        "diagnostic_questions": [
            "What external factors affected performance?",
            "Could we have anticipated these factors?",
            "Do we have contingency plans?",
            "How can we become more resilient?",
            "What early warning signs did we miss?"
        ],
        "common_solutions": [
            "Develop contingency plans",
            "Diversify dependencies",
            "Build buffer into targets",
            "Improve market intelligence",
            "Create early warning system"
        ],
        "prevention_measures": [
            "Regular environmental scanning",
            "Scenario planning exercises",
            "Diversification strategy",
            "Strong partner relationships"
        ]
    },
    
    GapType.RESOURCE: {
        "name": "Resource Constraints",
        "description": "Insufficient resources to achieve targets",
        "diagnostic_questions": [
            "What specific resources were lacking?",
            "Was this a planning or allocation issue?",
            "Can resources be reallocated?",
            "What's the ROI of additional resources?",
            "Are there creative alternatives?"
        ],
        "common_solutions": [
            "Prioritize and focus on fewer initiatives",
            "Seek additional funding/resources",
            "Improve resource utilization",
            "Outsource non-core activities",
            "Automate repetitive tasks"
        ],
        "prevention_measures": [
            "Resource planning framework",
            "Regular capacity assessments",
            "ROI analysis for all initiatives",
            "Automation roadmap"
        ]
    },
    
    GapType.PROCESS: {
        "name": "Process Issues",
        "description": "Inefficient or broken processes hindered performance",
        "diagnostic_questions": [
            "Which specific processes failed?",
            "Are processes documented?",
            "When were they last reviewed?",
            "Do people follow the processes?",
            "What are the bottlenecks?"
        ],
        "common_solutions": [
            "Map and optimize key processes",
            "Eliminate bottlenecks",
            "Automate where possible",
            "Regular process audits",
            "Clear process ownership"
        ],
        "prevention_measures": [
            "Process documentation standards",
            "Regular process reviews",
            "Continuous improvement culture",
            "Process metrics and KPIs"
        ]
    },
    
    GapType.KNOWLEDGE: {
        "name": "Knowledge/Skill Gap",
        "description": "Lack of necessary knowledge or skills",
        "diagnostic_questions": [
            "What specific skills were missing?",
            "Is this a training or hiring issue?",
            "Do we have access to expertise?",
            "How critical are these skills?",
            "What's the learning curve?"
        ],
        "common_solutions": [
            "Targeted training programs",
            "Hire specialists or consultants",
            "Create mentorship programs",
            "Build knowledge base",
            "Partner with experts"
        ],
        "prevention_measures": [
            "Skills inventory and gap analysis",
            "Learning and development budget",
            "Knowledge management system",
            "Strategic hiring plan"
        ]
    }
}


class ReviewAnalyzer:
    """Analyze review data and generate insights"""
    
    @staticmethod
    def analyze_metric_gap(
        metric_id: str,
        actual: float,
        target: float,
        historical_data: List[float]
    ) -> GapAnalysis:
        """Analyze why a metric missed its target"""
        gap_percentage = ((target - actual) / target) * 100 if target != 0 else 0
        
        # Determine likely gap type based on patterns
        gap_type = ReviewAnalyzer._determine_gap_type(
            actual, target, historical_data
        )
        
        # Get playbook recommendations
        playbook = GAP_PLAYBOOK[gap_type]
        
        # Estimate effort based on gap size
        if gap_percentage > 30:
            effort = "High"
            expected_improvement = min(gap_percentage * 0.5, 20)  # Conservative
        elif gap_percentage > 15:
            effort = "Medium"
            expected_improvement = min(gap_percentage * 0.7, 30)
        else:
            effort = "Low"
            expected_improvement = min(gap_percentage * 0.9, 40)
        
        return GapAnalysis(
            metric_id=metric_id,
            gap_type=gap_type,
            root_cause=f"Gap of {gap_percentage:.1f}% from target",
            impact_assessment=playbook["description"],
            recommended_actions=playbook["common_solutions"][:3],
            estimated_effort=effort,
            expected_improvement=expected_improvement
        )
    
    @staticmethod
    def _determine_gap_type(
        actual: float,
        target: float,
        historical: List[float]
    ) -> GapType:
        """Determine the most likely gap type"""
        if not historical:
            return GapType.PLANNING
        
        avg_historical = sum(historical) / len(historical)
        
        # If target was way above historical average, likely planning issue
        if target > avg_historical * 1.3:
            return GapType.PLANNING
        
        # If we've been declining, likely process or resource issue
        if len(historical) > 2 and historical[-1] < historical[-2] < historical[-3]:
            return GapType.PROCESS
        
        # If we suddenly dropped, likely execution or external
        if actual < avg_historical * 0.7:
            return GapType.EXTERNAL
        
        # Default to execution gap
        return GapType.EXECUTION
    
    @staticmethod
    def generate_action_items(
        gap_analysis: GapAnalysis,
        priority: ActionPriority = ActionPriority.HIGH
    ) -> List[ActionItem]:
        """Generate action items from gap analysis"""
        actions = []
        
        for idx, recommendation in enumerate(gap_analysis.recommended_actions[:2]):
            action = ActionItem(
                id=f"action_{gap_analysis.metric_id}_{idx}",
                title=f"Address {gap_analysis.gap_type.value} gap in {gap_analysis.metric_id}",
                description=recommendation,
                metric_id=gap_analysis.metric_id,
                priority=priority,
                due_date=date.today() + timedelta(days=7)
            )
            actions.append(action)
        
        return actions
    
    @staticmethod
    def calculate_review_completeness(review: WeeklyReview) -> float:
        """Calculate how complete a review is (0-100%)"""
        checks = [
            bool(review.metrics_entered),
            bool(review.metrics_analysis),
            review.primary_bottleneck is not None,
            bool(review.gaps_identified),
            bool(review.actions_from_gaps),
            bool(review.review_notes),
            bool(review.key_wins),
            bool(review.key_challenges),
            review.completed_at is not None
        ]
        
        return (sum(checks) / len(checks)) * 100