import os
import shutil
from app.database import SessionLocal, engine, Base
from app.models import User, Document
from app.services.vector_store import vector_store_service
from app.routers.documents import process_and_index_file
from app.auth import get_password_hash

def reindex_all():
    db = SessionLocal()
    try:
        # 1. Clean up old camelCase sample files
        sample_dir = "sample_data"
        for f in os.listdir(sample_dir):
            if f.startswith(('Academic_', 'Admission_', 'Fee_', 'Hostel_', 'Placement_')):
                try:
                    os.remove(os.path.join(sample_dir, f))
                    print(f"Removed legacy sample: {f}")
                except Exception as e:
                    print(f"Error removing {f}: {e}")

        # 2. Reset Document table
        db.query(Document).delete()
        db.commit()

        # 3. Ensure admin user
        admin = db.query(User).filter(User.role == 'admin').first()
        if not admin:
            admin = User(
                name="Dr. Robert Vance (Admin)",
                email="admin@college.edu",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # 4. Clear ChromaDB collection
        try:
            vector_store_service.client.delete_collection(vector_store_service.collection_name)
            vector_store_service._init_chroma()
            print("Chroma collection reset successfully.")
        except Exception as e:
            print(f"Collection reset note: {e}")

        # 5. Index rich sample documents with proper department tagging
        files_to_index = {
            "fee_structure.txt": "Admissions",
            "admission_guidelines.txt": "Admissions",
            "hostel_rules.txt": "Hostel",
            "placement_policy.txt": "Placements",
            "academic_calendar.txt": "General"
        }

        for filename, department in files_to_index.items():
            path = os.path.join(sample_dir, filename)
            if os.path.exists(path):
                doc_id = f"doc_{filename.replace('.', '_')}"
                doc = process_and_index_file(
                    file_path=path,
                    filename=filename,
                    doc_id=doc_id,
                    uploader_id=admin.user_id,
                    db=db,
                    department=department
                )
                print(f"Indexed: {doc.title} -> {doc.chunk_count} chunks (Department: {department})")

        total_chunks = vector_store_service.get_total_chunks()
        print(f"\nSUCCESS: Total indexed chunks in ChromaDB: {total_chunks}")

    finally:
        db.close()

if __name__ == "__main__":
    reindex_all()
