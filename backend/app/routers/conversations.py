import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Conversation, Message
from app.schemas import ConversationResponse, ConversationDetail, MessageResponse, SourceItem
from app.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class RenameConversationRequest(BaseModel):
    title: str

@router.get("", response_model=List[ConversationResponse])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.user_id
    ).order_by(Conversation.updated_at.desc()).all()

    results = []
    for c in convs:
        msg_count = db.query(Message).filter(Message.conversation_id == c.conversation_id).count()
        last_msg_obj = db.query(Message).filter(Message.conversation_id == c.conversation_id).order_by(Message.created_at.desc()).first()
        last_msg_text = last_msg_obj.content if last_msg_obj else ""

        results.append(
            ConversationResponse(
                conversation_id=c.conversation_id,
                title=c.title,
                created_at=c.created_at,
                updated_at=c.updated_at,
                message_count=msg_count,
                last_message=last_msg_text[:60] + ("..." if len(last_msg_text) > 60 else "")
            )
        )
    return results

@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation_detail(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == current_user.user_id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    formatted_messages = []
    for m in messages:
        sources_list = []
        if m.sources_json:
            try:
                raw_sources = json.loads(m.sources_json)
                sources_list = [SourceItem(**s) for s in raw_sources]
            except Exception:
                sources_list = []

        formatted_messages.append(
            MessageResponse(
                message_id=m.message_id,
                conversation_id=m.conversation_id,
                sender=m.sender,
                content=m.content,
                sources=sources_list,
                created_at=m.created_at
            )
        )

    return ConversationDetail(
        conversation_id=conv.conversation_id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=formatted_messages
    )

@router.patch("/{conversation_id}")
def rename_conversation(
    conversation_id: str,
    req: RenameConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == current_user.user_id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.title = req.title.strip()
    db.commit()
    return {"message": "Conversation title updated", "title": conv.title}

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id,
        Conversation.user_id == current_user.user_id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully"}
