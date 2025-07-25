"""
Export functionality for CEO Dashboard
Handles PDF and Excel exports of dashboard data
"""

import json
import sqlite3
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Any
import csv

class DashboardExporter:
    """Export dashboard data in various formats"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def export_to_csv(self, output_path: str, date_range: tuple = None) -> str:
        """Export metrics data to CSV"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Build query
        query = """
            SELECT 
                m.name as metric_name,
                m.category,
                m.unit,
                v.date,
                v.value,
                t.target_value
            FROM metrics m
            LEFT JOIN metric_values v ON m.id = v.metric_id
            LEFT JOIN metric_targets t ON m.id = t.metric_id 
                AND v.date BETWEEN t.period_start AND t.period_end
            WHERE 1=1
        """
        
        params = []
        if date_range:
            query += " AND v.date BETWEEN ? AND ?"
            params.extend(date_range)
        
        query += " ORDER BY m.category, m.name, v.date"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # Write CSV
        output = Path(output_path)
        with open(output, 'w', newline='') as csvfile:
            if rows:
                writer = csv.DictWriter(csvfile, fieldnames=rows[0].keys())
                writer.writeheader()
                for row in rows:
                    writer.writerow(dict(row))
        
        conn.close()
        return str(output)
    
    def export_weekly_summary(self, week: int, year: int) -> Dict[str, Any]:
        """Export weekly review summary as JSON"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get weekly review data
        cursor.execute("""
            SELECT * FROM weekly_reviews 
            WHERE week_number = ? AND year = ?
        """, (week, year))
        
        review = cursor.fetchone()
        
        # Get metrics for that week
        week_start = self._get_week_dates(year, week)[0]
        cursor.execute("""
            SELECT 
                m.id,
                m.name,
                m.category,
                v.value,
                t.target_value,
                CASE 
                    WHEN v.value >= t.target_value * 0.9 THEN 'green'
                    WHEN v.value >= t.target_value * 0.7 THEN 'yellow'
                    ELSE 'red'
                END as status
            FROM metrics m
            LEFT JOIN metric_values v ON m.id = v.metric_id
            LEFT JOIN metric_targets t ON m.id = t.metric_id
            WHERE v.week_number = ? AND v.date >= ?
            ORDER BY m.category, m.name
        """, (week, week_start))
        
        metrics = [dict(row) for row in cursor.fetchall()]
        
        summary = {
            "week": week,
            "year": year,
            "review": dict(review) if review else None,
            "metrics": metrics,
            "exported_at": datetime.now().isoformat()
        }
        
        conn.close()
        return summary
    
    def export_dashboard_snapshot(self) -> Dict[str, Any]:
        """Export current dashboard state as JSON"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get latest metrics
        cursor.execute("""
            SELECT 
                m.*,
                v.value as current_value,
                v.date as last_updated,
                t.target_value
            FROM metrics m
            LEFT JOIN (
                SELECT metric_id, value, date,
                       ROW_NUMBER() OVER (PARTITION BY metric_id ORDER BY date DESC) as rn
                FROM metric_values
            ) v ON m.id = v.metric_id AND v.rn = 1
            LEFT JOIN metric_targets t ON m.id = t.metric_id
                AND date('now') BETWEEN t.period_start AND t.period_end
            ORDER BY m.category, m.name
        """)
        
        metrics = [dict(row) for row in cursor.fetchall()]
        
        # Calculate health score
        health_score = self._calculate_health_score(metrics)
        
        # Identify bottlenecks
        bottlenecks = self._identify_bottlenecks(metrics)
        
        snapshot = {
            "timestamp": datetime.now().isoformat(),
            "health_score": health_score,
            "total_metrics": len(metrics),
            "metrics_on_track": sum(1 for m in metrics if self._get_status(m) == 'green'),
            "metrics_at_risk": sum(1 for m in metrics if self._get_status(m) == 'yellow'),
            "metrics_off_track": sum(1 for m in metrics if self._get_status(m) == 'red'),
            "primary_bottleneck": bottlenecks[0] if bottlenecks else None,
            "metrics": metrics
        }
        
        conn.close()
        return snapshot
    
    def generate_executive_report(self, output_path: str) -> str:
        """Generate executive summary report in markdown"""
        snapshot = self.export_dashboard_snapshot()
        
        report = f"""# Executive Dashboard Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Overall Health Score: {snapshot['health_score']:.1f}%

### Metrics Summary
- **On Track (Green):** {snapshot['metrics_on_track']} metrics
- **At Risk (Yellow):** {snapshot['metrics_at_risk']} metrics  
- **Off Track (Red):** {snapshot['metrics_off_track']} metrics
- **Total Tracked:** {snapshot['total_metrics']} metrics

### Primary Bottleneck
{snapshot['primary_bottleneck']['name'] if snapshot['primary_bottleneck'] else 'No critical bottlenecks identified'}

### Performance by Category
"""
        
        # Group metrics by category
        categories = {}
        for metric in snapshot['metrics']:
            cat = metric['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(metric)
        
        for category, metrics in categories.items():
            report += f"\n#### {category}\n"
            for m in metrics:
                status = self._get_status(m)
                status_emoji = {'green': '🟢', 'yellow': '🟡', 'red': '🔴', 'gray': '⚪'}.get(status, '⚪')
                value = m.get('current_value', 'No data')
                target = m.get('target_value', 'No target')
                report += f"- {status_emoji} **{m['name']}**: {value} (Target: {target})\n"
        
        # Save report
        output = Path(output_path)
        output.write_text(report)
        
        return str(output)
    
    def _get_week_dates(self, year: int, week: int) -> tuple:
        """Get start and end dates for a given week"""
        jan1 = date(year, 1, 1)
        week_start = jan1 + datetime.timedelta(days=(week - 1) * 7 - jan1.weekday())
        week_end = week_start + datetime.timedelta(days=6)
        return week_start, week_end
    
    def _get_status(self, metric: Dict[str, Any]) -> str:
        """Calculate metric status"""
        if not metric.get('current_value') or not metric.get('target_value'):
            return 'gray'
        
        ratio = metric['current_value'] / metric['target_value']
        if not metric.get('is_higher_better', True):
            ratio = 2 - ratio
        
        if ratio >= 0.9:
            return 'green'
        elif ratio >= 0.7:
            return 'yellow'
        else:
            return 'red'
    
    def _calculate_health_score(self, metrics: List[Dict[str, Any]]) -> float:
        """Calculate overall health score"""
        if not metrics:
            return 0.0
        
        status_scores = {'green': 100, 'yellow': 70, 'red': 30, 'gray': 50}
        total_score = sum(status_scores.get(self._get_status(m), 50) for m in metrics)
        
        return total_score / len(metrics)
    
    def _identify_bottlenecks(self, metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify bottleneck metrics"""
        bottlenecks = []
        
        for metric in metrics:
            status = self._get_status(metric)
            if status in ['red', 'yellow']:
                score = 100 if status == 'red' else 60
                bottlenecks.append({
                    'name': metric['name'],
                    'category': metric['category'],
                    'status': status,
                    'score': score
                })
        
        # Sort by score descending
        bottlenecks.sort(key=lambda x: x['score'], reverse=True)
        return bottlenecks[:3]  # Top 3