from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SplitSnap API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB by default
    CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
