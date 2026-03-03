"""
Feedback Router - Teacher to Admin Feedback System
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from models import FeedbackCreate, FeedbackCategory, FeedbackStatus
from database import get_db
from sqlite_models import Feedback, User
from routers.auth import get_current_user

router = APIRouter()

@router.post("/")
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new feedback (Teachers only)"""
    if current_user.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can submit feedback")
    
    try:
        new_feedback = Feedback(
            sender_id=current_user.get("id"),
            category=feedback_data.category.value,
            message=feedback_data.message,
            status="pending"
        )
        
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        
        return {
            "message": "Feedback submitted successfully",
            "feedback": {
                "id": new_feedback.id,
                "category": new_feedback.category,
                "message": new_feedback.message,
                "status": new_feedback.status,
                "created_at": new_feedback.created_at.isoformat() if new_feedback.created_at else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mine")
async def get_my_feedback(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's feedback"""
    feedbacks = db.query(Feedback).filter(Feedback.sender_id == current_user.get("id")).order_by(Feedback.created_at.desc()).all()
    
    return [
        {
            "id": f.id,
            "category": f.category,
            "message": f.message,
            "status": f.status,
            "admin_response": f.admin_response,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "responded_at": f.responded_at.isoformat() if f.responded_at else None
        }
        for f in feedbacks
    ]

@router.get("/")
async def get_all_feedback(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all feedback (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all feedback")
    
    query = db.query(Feedback, User).join(User, Feedback.sender_id == User.id, isouter=True)
    
    if status:
        query = query.filter(Feedback.status == status)
    
    results = query.order_by(Feedback.created_at.desc()).all()
    
    return [
        {
            "id": f.id,
            "sender_id": f.sender_id,
            "sender_name": u.name if u else "Unknown",
            "sender_institution_id": u.institution_id if u else "Unknown",
            "sender_avatar": u.avatar if u else "male",
            "category": f.category,
            "message": f.message,
            "status": f.status,
            "admin_response": f.admin_response,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "responded_at": f.responded_at.isoformat() if f.responded_at else None
        }
        for f, u in results
    ]

@router.post("/{feedback_id}/respond")
async def respond_to_feedback(
    feedback_id: int,
    response_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Respond to feedback (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can respond to feedback")
    
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.admin_response = response_data.get("response")
    feedback.status = "responded"
    feedback.responded_by = current_user.get("id")
    feedback.responded_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Response sent successfully"}

@router.patch("/{feedback_id}/archive")
async def archive_feedback(
    feedback_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Archive feedback (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can archive feedback")
    
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.status = "archived"
    db.commit()
    
    return {"message": "Feedback archived"}

@router.get("/stats")
async def get_feedback_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feedback statistics (Admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view stats")
    
    total = db.query(func.count(Feedback.id)).scalar() or 0
    pending = db.query(func.count(Feedback.id)).filter(Feedback.status == "pending").scalar() or 0
    responded = db.query(func.count(Feedback.id)).filter(Feedback.status == "responded").scalar() or 0
    archived = db.query(func.count(Feedback.id)).filter(Feedback.status == "archived").scalar() or 0
    
    return {
        "total": total,
        "pending": pending,
        "responded": responded,
        "archived": archived
    }
