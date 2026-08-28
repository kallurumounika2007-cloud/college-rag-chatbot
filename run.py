import os
import sys
from pathlib import Path

# Add backend directory to python path
BACKEND_DIR = Path(__file__).resolve().parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
os.chdir(BACKEND_DIR)

import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting server on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=False, app_dir=str(BACKEND_DIR))
