import sys
import os
import json

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure app package is findable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, Document, Conversation, Message
from app.main import init_db_and_seed
from app.services.vector_store import vector_store_service
from app.services.rag_engine import rag_engine
from app.auth import verify_password, create_access_token

def test_full_rag_pipeline():
    print("=== STEP 1: INITIALIZING DATABASE & SEEDING ===")
    init_db_and_seed()
    db = SessionLocal()
    
    admin_user = db.query(User).filter(User.email == "admin@college.edu").first()
    student_user = db.query(User).filter(User.email == "student@college.edu").first()
    
    assert admin_user is not None, "Admin user should exist"
    assert student_user is not None, "Student user should exist"
    assert verify_password("admin123", admin_user.password_hash), "Admin password verification should succeed"
    assert verify_password("student123", student_user.password_hash), "Student password verification should succeed"
    print(f"[OK] Authentication models verified. Admin: {admin_user.email}, Student: {student_user.email}")

    print("\n=== STEP 2: VERIFYING CHROMADB VECTOR STORE & INDEXED DOCUMENTS ===")
    total_chunks = vector_store_service.get_total_chunks()
    docs = db.query(Document).all()
    print(f"[OK] Documents in database: {len(docs)}")
    for d in docs:
        print(f"   - {d.title} ({d.file_type}): {d.chunk_count} chunks, status: {d.status}")
    print(f"[OK] Total semantic vector chunks indexed in ChromaDB: {total_chunks}")
    assert total_chunks > 0, "ChromaDB should contain indexed chunks"

    print("\n=== STEP 3: TESTING RAG SEMANTIC QUERY - CSE TUITION FEE ===")
    query1 = "What is the annual tuition fee for CSE students?"
    result1 = rag_engine.answer_query(query1)
    print(f"Query: {query1}")
    print(f"Answer:\n{result1['answer']}")
    print(f"Sources ({len(result1['sources'])}):")
    for s in result1['sources']:
        print(f"   * {s.document_title} (Page {s.page_number}) - Relevance: {s.score}")
    assert result1['has_sources'] is True, "Query 1 should have valid sources"
    assert len(result1['sources']) > 0, "Query 1 should cite sources"

    print("\n=== STEP 4: TESTING RAG SEMANTIC QUERY - EXAM DATES ===")
    query2 = "When are the semester theory examinations scheduled?"
    result2 = rag_engine.answer_query(query2)
    print(f"Query: {query2}")
    print(f"Answer:\n{result2['answer']}")
    print(f"Sources ({len(result2['sources'])}):")
    for s in result2['sources']:
        print(f"   * {s.document_title} (Page {s.page_number}) - Relevance: {s.score}")
    assert result2['has_sources'] is True, "Query 2 should have valid sources"

    print("\n=== STEP 5: TESTING OUT-OF-SCOPE UNKNOWN QUERY (HALLUCINATION PREVENTION) ===")
    query3 = "What is the secret recipe for cafeteria brownies?"
    result3 = rag_engine.answer_query(query3)
    print(f"Query: {query3}")
    print(f"Answer:\n{result3['answer']}")
    print(f"Sources count: {len(result3['sources'])}, has_sources: {result3['has_sources']}")

    print("\n=== ALL RAG PIPELINE & DATABASE TESTS PASSED SUCCESSFULLY! ===")
    db.close()

if __name__ == "__main__":
    test_full_rag_pipeline()
