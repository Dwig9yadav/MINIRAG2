"""
Analytics Router - System Statistics and Insights
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import List
from datetime import datetime, timedelta

from database import get_db
from sqlite_models import User, SearchHistory, PDF, Feedback
from routers.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_system_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get system summary statistics"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view analytics")
    
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_searches = db.query(func.count(SearchHistory.id)).scalar() or 0
    total_pdfs = db.query(func.count(PDF.id)).scalar() or 0
    indexed_pdfs = db.query(func.count(PDF.id)).filter(PDF.status == "indexed").scalar() or 0
    
    # Today's stats
    today = datetime.utcnow().date()
    today_searches = db.query(func.count(SearchHistory.id)).filter(
        func.date(SearchHistory.created_at) == today
    ).scalar() or 0
    
    # Pending feedback
    pending_feedback = db.query(func.count(Feedback.id)).filter(Feedback.status == "pending").scalar() or 0
    
    return {
        "total_users": total_users,
        "total_searches": total_searches,
        "total_pdfs": total_pdfs,
        "indexed_pdfs": indexed_pdfs,
        "today_searches": today_searches,
        "pending_feedback": pending_feedback,
        "system_health": "healthy"
    }

@router.get("/usage-by-role")
async def get_usage_by_role(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get search usage breakdown by role"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view analytics")
    
    # Join search history with users and group by role
    results = db.query(
        User.role,
        func.count(SearchHistory.id).label('count')
    ).join(SearchHistory, User.id == SearchHistory.user_id).group_by(User.role).all()
    
    if results:
        total = sum(r.count for r in results)
        return [
            {
                "role": r.role,
                "count": r.count,
                "percentage": round((r.count / total) * 100, 1) if total > 0 else 0
            }
            for r in results
        ]
    
    # Demo data
    return [
        {"role": "student", "count": 850, "percentage": 65.0},
        {"role": "teacher", "count": 380, "percentage": 29.0},
        {"role": "admin", "count": 78, "percentage": 6.0}
    ]

@router.get("/language-usage")
async def get_language_usage(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get search language usage"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view analytics")
    
    results = db.query(
        SearchHistory.language,
        func.count(SearchHistory.id).label('count')
    ).group_by(SearchHistory.language).all()
    
    if results:
        return [{"language": r.language or "english", "count": r.count} for r in results]
    
    # Demo data
    return [
        {"language": "english", "count": 520},
        {"language": "hindi", "count": 280},
        {"language": "hinglish", "count": 150}
    ]

@router.get("/daily-queries")
async def get_daily_queries(
    days: int = 30,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily query counts"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view analytics")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    results = db.query(
        func.date(SearchHistory.created_at).label('date'),
        func.count(SearchHistory.id).label('count')
    ).filter(
        SearchHistory.created_at >= start_date
    ).group_by(func.date(SearchHistory.created_at)).order_by(func.date(SearchHistory.created_at)).all()
    
    if results:
        return [{"date": str(r.date), "count": r.count} for r in results]
    
    # Generate demo data
    demo_data = []
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=days-i)).date()
        demo_data.append({
            "date": str(date),
            "count": 30 + (i % 10) * 5
        })
    return demo_data

@router.get("/student-insights")
async def get_student_insights(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get student learning insights (for teachers)"""
    if current_user.get("role") not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Only teachers and admins can view insights")
    
    # Count students
    total_students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    
    # Get students with most searches (active learners)
    active = db.query(
        User.name,
        User.institution_id,
        func.count(SearchHistory.id).label('searches')
    ).join(SearchHistory, User.id == SearchHistory.user_id).filter(
        User.role == "student"
    ).group_by(User.id).order_by(func.count(SearchHistory.id).desc()).limit(5).all()
    
    active_learners = [
        {"name": a.name, "institution_id": a.institution_id, "searches": a.searches}
        for a in active
    ] if active else [
        {"name": "Demo Student", "institution_id": "24155012345", "searches": 45}
    ]
    
    return {
        "total_students": total_students,
        "active_learners": active_learners,
        "avg_queries_per_student": round(
            db.query(func.count(SearchHistory.id)).scalar() / max(total_students, 1), 1
        )
    }

@router.get("/top-topics")
async def get_top_topics(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get most searched topics"""
    results = db.query(
        SearchHistory.query,
        func.count(SearchHistory.id).label('count')
    ).group_by(SearchHistory.query).order_by(func.count(SearchHistory.id).desc()).limit(limit).all()
    
    if results:
        return [{"topic": r.query, "count": r.count, "trend": "stable"} for r in results]
    
    # Demo data
    return [
        {"topic": "Integration by parts", "count": 45, "trend": "up"},
        {"topic": "Probability basics", "count": 38, "trend": "stable"},
        {"topic": "Matrix multiplication", "count": 32, "trend": "down"},
        {"topic": "Derivatives", "count": 28, "trend": "up"},
        {"topic": "Statistics formulas", "count": 25, "trend": "stable"}
    ]
