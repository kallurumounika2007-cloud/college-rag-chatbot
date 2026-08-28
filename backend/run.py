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
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    is_prod = os.environ.get("RENDER") is not None or os.environ.get("NODE_ENV") == "production"

    print("=" * 70)
    print(f"  Starting College Information Chatbot Backend API on {host}:{port}")
    print(f"  API Docs: http://{host}:{port}/docs")
    print("=" * 70)
    try:
        uvicorn.run(
            "app.main:app",
            host=host,
            port=port,
            reload=not is_prod,
            app_dir=str(BACKEND_DIR)
        )
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...")
