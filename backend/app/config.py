import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "College Information Chatbot"
    API_V1_STR: str = "/api"
    
    # Security & Auth
    SECRET_KEY: str = "college-chatbot-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'college_bot.db'}"
    
    # ChromaDB Vector Store
    CHROMA_PERSIST_DIRECTORY: str = str(BASE_DIR / "chroma_db")
    COLLECTION_NAME: str = "college_documents"
    
    # Storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    SAMPLE_DATA_DIR: str = str(BASE_DIR / "sample_data")
    
    # LLM & Embeddings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # RAG Settings
    TOP_K_CHUNKS: int = 4
    SIMILARITY_THRESHOLD: float = 0.25
    CHUNK_SIZE: int = 650
    CHUNK_OVERLAP: int = 100
    
    # CORS
    CORS_ORIGINS: Any = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    def get_cors_origins(self) -> list[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]
        return ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)
