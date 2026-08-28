from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, Document, Conversation, Message, MessageFeedback
from app.schemas import AdminStats, UserResponse
from app.auth import require_admin
from app.services.vector_store import vector_store_service

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_docs = db.query(Document).count()
    total_convs = db.query(Conversation).count()
    total_msgs = db.query(Message).count()
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    total_vector_chunks = vector_store_service.get_total_chunks()

    # Status breakdown
    statuses = db.query(Document.status, func.count(Document.document_id)).group_by(Document.status).all()
    breakdown = {status: count for status, count in statuses}

    # Department breakdown
    dept_rows = db.query(Document.department, func.count(Document.document_id)).group_by(Document.department).all()
    dept_breakdown = {dept: count for dept, count in dept_rows if dept}

    # Feedback calculations
    pos_fb = db.query(MessageFeedback).filter(MessageFeedback.is_positive == True).count()
    neg_fb = db.query(MessageFeedback).filter(MessageFeedback.is_positive == False).count()
    total_fb = pos_fb + neg_fb
    satisfaction = round((pos_fb / total_fb * 100.0), 1) if total_fb > 0 else 100.0

    return AdminStats(
        total_documents=total_docs,
        total_chunks=total_vector_chunks,
        total_conversations=total_convs,
        total_messages=total_msgs,
        total_users=total_users,
        total_students=total_students,
        total_admins=total_admins,
        positive_feedback_count=pos_fb,
        negative_feedback_count=neg_fb,
        satisfaction_rate=satisfaction,
        document_status_breakdown=breakdown,
        department_breakdown=dept_breakdown
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users
