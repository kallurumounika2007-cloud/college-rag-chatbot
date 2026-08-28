import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Document
from app.auth import get_password_hash
from app.routers import auth, documents, chat, conversations, admin, faqs
from app.services.vector_store import vector_store_service
from app.routers.documents import process_and_index_file

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def migrate_db():
    """
    Safe SQLite schema migration: add any missing columns to existing tables.
    This handles the case where the DB was created before new columns were added.
    """
    migrations = [
        ("documents", "department", "VARCHAR(50) DEFAULT 'General' NOT NULL"),
    ]
    with engine.connect() as conn:
        for table, column, col_def in migrations:
            try:
                # Check if column already exists via PRAGMA
                result = conn.execute(
                    __import__("sqlalchemy").text(f"PRAGMA table_info({table})")
                )
                existing_cols = [row[1] for row in result.fetchall()]
                if column not in existing_cols:
                    conn.execute(
                        __import__("sqlalchemy").text(
                            f"ALTER TABLE {table} ADD COLUMN {column} {col_def}"
                        )
                    )
                    conn.commit()
                    logger.info(f"Migration applied: added column '{column}' to table '{table}'")
            except Exception as e:
                logger.warning(f"Migration skipped for {table}.{column}: {e}")

def init_db_and_seed():
    """Create database tables and insert initial demo users and documents."""
    Base.metadata.create_all(bind=engine)
    migrate_db()
    db = SessionLocal()
    try:
        # Seed Default Admin
        admin_email = "admin@college.edu"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                name="Dr. Robert Vance (Admin)",
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            logger.info(f"Default admin account created: {admin_email} / admin123")

        # Seed Default Student
        student_email = "student@college.edu"
        student_user = db.query(User).filter(User.email == student_email).first()
        if not student_user:
            student_user = User(
                name="Alex Morgan (Student)",
                email=student_email,
                password_hash=get_password_hash("student123"),
                role="student"
            )
            db.add(student_user)
            db.commit()
            db.refresh(student_user)
            logger.info(f"Default student account created: {student_email} / student123")

        # Auto-seed sample college handbook documents if none exist
        existing_docs_count = db.query(Document).count()
        if existing_docs_count == 0 and os.path.exists(settings.SAMPLE_DATA_DIR):
            sample_files = [f for f in os.listdir(settings.SAMPLE_DATA_DIR) if os.path.isfile(os.path.join(settings.SAMPLE_DATA_DIR, f))]
            logger.info(f"Auto-seeding {len(sample_files)} sample college documents into knowledge base...")
            for sf in sample_files:
                src_path = os.path.join(settings.SAMPLE_DATA_DIR, sf)
                dest_path = os.path.join(settings.UPLOAD_DIR, f"seed_{sf}")
                if not os.path.exists(dest_path):
                    import shutil
                    shutil.copy2(src_path, dest_path)
                try:
                    # Assign realistic departments
                    dept = "General"
                    if "fee" in sf.lower():
                        dept = "Admissions"
                    elif "admission" in sf.lower():
                        dept = "Admissions"
                    elif "hostel" in sf.lower():
                        dept = "Hostel"
                    elif "placement" in sf.lower():
                        dept = "Placements"
                    elif "calendar" in sf.lower():
                        dept = "General"

                    process_and_index_file(
                        file_path=dest_path,
                        filename=sf,
                        doc_id=f"doc_{sf.replace('.', '_')}",
                        uploader_id=admin_user.user_id,
                        db=db,
                        department=dept
                    )
                    logger.info(f"Indexed sample document: {sf} (Dept: {dept})")
                except Exception as e:
                    logger.error(f"Failed to auto-index {sf}: {e}")

    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing College Information Chatbot API backend...")
    init_db_and_seed()
    yield
    # Shutdown
    logger.info("Shutting down API backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-featured RAG-Based College Information Chatbot API with Document Processing and Semantic Search",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(faqs.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "chroma_chunks": vector_store_service.get_total_chunks(),
        "openai_configured": bool(settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 10),
        "gemini_configured": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10)
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to the RAG-Based College Information Chatbot API",
        "docs": "/docs",
        "health": "/api/health"
    }
