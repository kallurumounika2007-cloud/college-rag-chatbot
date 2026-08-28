import json
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Conversation, Message, MessageFeedback
from app.schemas import ChatRequest, ChatResponse, SourceItem, FeedbackCreate, FeedbackResponse
from app.auth import get_current_user
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
def ask_question(
    chat_req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query_text = chat_req.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    # 1. Resolve or create conversation
    conv_id = chat_req.conversation_id
    if conv_id:
        conversation = db.query(Conversation).filter(
            Conversation.conversation_id == conv_id,
            Conversation.user_id == current_user.user_id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Create a new conversation title (first 50 chars of query)
        short_title = query_text[:45] + ("..." if len(query_text) > 45 else "")
        conversation = Conversation(
            user_id=current_user.user_id,
            title=short_title
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conv_id = conversation.conversation_id

    # 2. Save user message
    now = datetime.utcnow()
    user_msg = Message(
        conversation_id=conv_id,
        sender="user",
        content=query_text,
        created_at=now
    )
    db.add(user_msg)
    db.commit()

    # 3. Execute RAG pipeline
    rag_result = rag_engine.answer_query(
        query=query_text,
        department_filter=chat_req.department,
        language=chat_req.language or "en"
    )
    answer_text = rag_result.get("answer", "")
    sources = rag_result.get("sources", [])
    has_sources = rag_result.get("has_sources", False)
    confidence = rag_result.get("confidence", "High")
    followups = rag_result.get("suggested_followups", [])

    # 4. Save assistant response
    sources_data = [s.model_dump() if hasattr(s, 'model_dump') else (s.dict() if hasattr(s, 'dict') else s) for s in sources]
    sources_json_str = json.dumps(sources_data) if sources_data else None

    assistant_msg = Message(
        conversation_id=conv_id,
        sender="assistant",
        content=answer_text,
        sources_json=sources_json_str,
        created_at=now
    )
    db.add(assistant_msg)
    
    # Touch conversation timestamp
    conversation.updated_at = now
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        conversation_id=conv_id,
        message_id=assistant_msg.message_id,
        answer=answer_text,
        sources=sources,
        has_sources=has_sources,
        confidence=confidence,
        suggested_followups=followups
    )

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify message exists
    msg = db.query(Message).filter(Message.message_id == feedback_in.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Update or insert feedback
    existing_fb = db.query(MessageFeedback).filter(
        MessageFeedback.message_id == feedback_in.message_id,
        MessageFeedback.user_id == current_user.user_id
    ).first()

    if existing_fb:
        existing_fb.is_positive = feedback_in.is_positive
        existing_fb.comment = feedback_in.comment
        db.commit()
        db.refresh(existing_fb)
        return existing_fb
    else:
        new_fb = MessageFeedback(
            message_id=feedback_in.message_id,
            user_id=current_user.user_id,
            is_positive=feedback_in.is_positive,
            comment=feedback_in.comment
        )
        db.add(new_fb)
        db.commit()
        db.refresh(new_fb)
        return new_fb
