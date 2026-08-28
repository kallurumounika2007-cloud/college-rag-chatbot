import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # "student" | "admin"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="uploader", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("MessageFeedback", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    document_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # "pdf", "docx", "txt"
    file_size = Column(Integer, default=0)
    department = Column(String(50), default="General", nullable=False)  # "General", "CSE", "ECE", "Admissions", "Hostel", "Placements"
    uploaded_by = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(30), default="processing")  # "processing" | "ready" | "failed"
    chunk_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    # Relationships
    uploader = relationship("User", back_populates="documents")

class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    title = Column(String(200), default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    message_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.conversation_id"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)  # JSON string of retrieved chunks
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    feedbacks = relationship("MessageFeedback", back_populates="message", cascade="all, delete-orphan")

class MessageFeedback(Base):
    __tablename__ = "message_feedbacks"

    feedback_id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    message_id = Column(String(36), ForeignKey("messages.message_id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    is_positive = Column(Boolean, nullable=False)  # True = helpful, False = unhelpful
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    message = relationship("Message", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")
