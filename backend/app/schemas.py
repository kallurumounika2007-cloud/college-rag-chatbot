from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "student"

class UserCreate(UserBase):
    password: str = Field(..., min_length=4)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

# --- Source Citation Schemas ---
class SourceItem(BaseModel):
    document_id: str
    document_title: str
    page_number: Optional[int] = None
    chunk_index: int
    excerpt: str
    score: Optional[float] = None
    confidence_level: Optional[str] = "High"  # "High" | "Medium" | "Low"
    department: Optional[str] = "General"

# --- Document Schemas ---
class DocumentResponse(BaseModel):
    document_id: str
    title: str
    file_type: str
    file_size: int
    department: str = "General"
    uploaded_by: Optional[str] = None
    uploaded_at: datetime
    status: str
    chunk_count: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class DocumentChunkView(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    page_number: Optional[int] = None
    chunk_index: int
    department: Optional[str] = "General"
    content: str

# --- Chat & Conversation Schemas ---
class MessageCreate(BaseModel):
    content: str
    conversation_id: Optional[str] = None

class MessageResponse(BaseModel):
    message_id: str
    conversation_id: str
    sender: str
    content: str
    sources: Optional[List[SourceItem]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    conversation_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationDetail(BaseModel):
    conversation_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    department: Optional[str] = None  # Filter: "CSE", "ECE", "Admissions", "Hostel", "Placements", "General"
    language: Optional[str] = "en"    # "en", "hi", "te", "es", "fr"

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    answer: str
    sources: List[SourceItem] = []
    has_sources: bool = False
    confidence: Optional[str] = "High"  # "High" | "Medium" | "Low"
    suggested_followups: Optional[List[str]] = []

class FeedbackCreate(BaseModel):
    message_id: str
    is_positive: bool
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    feedback_id: str
    message_id: str
    is_positive: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- FAQ Schemas ---
class FAQItem(BaseModel):
    id: str
    question: str
    answer: str
    category: str
    document_title: str

# --- Admin Schemas ---
class AdminStats(BaseModel):
    total_documents: int
    total_chunks: int
    total_conversations: int
    total_messages: int
    total_users: int
    total_students: int
    total_admins: int
    positive_feedback_count: int = 0
    negative_feedback_count: int = 0
    satisfaction_rate: float = 100.0
    document_status_breakdown: dict[str, int]
    department_breakdown: dict[str, int] = {}
