"""Application Configuration"""

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    """App Settings from environment variables"""
    
    # API
    API_TITLE: str = "Translator App API"
    API_VERSION: str = "1.0.0"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./translator.db"
    )
    
    # API Keys
    GOOGLE_TRANSLATE_API_KEY: str = os.getenv("GOOGLE_TRANSLATE_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000",
    ]
    
    # Limits
    MAX_TEXT_LENGTH: int = 5000
    MAX_FILE_SIZE_MB: int = 10
    
    # Features
    ENABLE_VOICE: bool = True
    ENABLE_OCR: bool = True
    ENABLE_HISTORY: bool = True
    
    # Supported languages
    SUPPORTED_LANGUAGES: list = [
        "en", "hi", "es", "fr", "de", "zh", "ja", "pt", "it", "ko"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
