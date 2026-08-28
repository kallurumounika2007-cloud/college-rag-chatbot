import os
import sys
from pathlib import Path
import uvicorn

# Ensure the backend directory is in sys.path and set as current working directory
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
os.chdir(BACKEND_DIR)

if __name__ == "__main__":
    print("=" * 70)
    print("  Starting College Information Chatbot Backend API")
    print("  Local Server:  http://127.0.0.1:8000")
    print("  API Docs:      http://127.0.0.1:8000/docs")
    print("  Health Check:  http://127.0.0.1:8000/api/health")
    print("=" * 70)
    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            app_dir=str(BACKEND_DIR)
        )
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...")
