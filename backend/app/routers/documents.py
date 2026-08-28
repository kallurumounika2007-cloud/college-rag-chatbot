import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User, Document
from app.schemas import DocumentResponse, DocumentChunkView
from app.auth import get_current_user, require_admin
from app.services.document_parser import extract_document_pages
from app.services.chunker import chunk_document_pages
from app.services.vector_store import vector_store_service

router = APIRouter(prefix="/documents", tags=["Documents"])

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

def process_and_index_file(
    file_path: str, 
    filename: str, 
    doc_id: str, 
    uploader_id: str, 
    db: Session,
    department: str = "General"
) -> Document:
    ext = os.path.splitext(filename)[1].lower()
    title = os.path.splitext(filename)[0].replace("_", " ").title()
    file_size = os.path.getsize(file_path)

    doc_record = Document(
        document_id=doc_id,
        title=title,
        file_path=file_path,
        file_type=ext.replace(".", ""),
        file_size=file_size,
        department=department,
        uploaded_by=uploader_id,
        status="processing",
        chunk_count=0
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    try:
        # Extract pages
        pages = extract_document_pages(file_path, ext)
        if not pages:
            raise ValueError("No readable text could be extracted from the file.")

        # Chunk pages
        chunks = chunk_document_pages(
            document_id=doc_id,
            document_title=title,
            pages_data=pages,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

        for c in chunks:
            c["department"] = department

        if not chunks:
            raise ValueError("Document could not be divided into text chunks.")

        # Index in ChromaDB
        added_count = vector_store_service.add_chunks(chunks)

        # Update DB record
        doc_record.chunk_count = added_count
        doc_record.status = "ready"
        db.commit()
        db.refresh(doc_record)
        return doc_record

    except Exception as e:
        doc_record.status = "failed"
        doc_record.error_message = str(e)
        db.commit()
        db.refresh(doc_record)
        raise e

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    department: str = Form("General"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    doc_id = str(uuid.uuid4())
    clean_filename = f"{doc_id}_{file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, clean_filename)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        doc_record = process_and_index_file(
            file_path=save_path,
            filename=file.filename,
            doc_id=doc_id,
            uploader_id=current_user.user_id,
            db=db,
            department=department
        )
        return doc_record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return docs

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{document_id}/chunks", response_model=List[DocumentChunkView])
def get_document_chunks(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    chunks = vector_store_service.get_chunks_for_document(document_id)
    return chunks

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove chunks from vector store
    vector_store_service.delete_document_chunks(document_id)

    # Remove file from disk if exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": f"Document '{doc.title}' and associated vector embeddings deleted successfully"}

@router.post("/seed-samples")
def seed_sample_documents(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Seed the knowledge base with sample college handbook documents."""
    sample_files = [f for f in os.listdir(settings.SAMPLE_DATA_DIR) if os.path.isfile(os.path.join(settings.SAMPLE_DATA_DIR, f))]
    if not sample_files:
        raise HTTPException(status_code=404, detail="No sample documents found in sample_data directory")

    seeded_docs = []
    for sf in sample_files:
        src_path = os.path.join(settings.SAMPLE_DATA_DIR, sf)
        title = os.path.splitext(sf)[0].replace("_", " ").title()

        # Check if already seeded with this title
        existing = db.query(Document).filter(Document.title == title).first()
        if existing:
            continue

        doc_id = str(uuid.uuid4())
        dest_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}_{sf}")
        shutil.copy2(src_path, dest_path)

        try:
            doc = process_and_index_file(
                file_path=dest_path,
                filename=sf,
                doc_id=doc_id,
                uploader_id=current_user.user_id,
                db=db
            )
            seeded_docs.append(doc.title)
        except Exception as e:
            continue

    return {
        "message": f"Successfully indexed {len(seeded_docs)} sample college documents.",
        "documents": seeded_docs
    }
