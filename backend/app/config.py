# from pydantic_settings import BaseSettings

# class Settings(BaseSettings):
#     API_V1_STR: str = "/api/v1"
#     PROJECT_NAME: str = "IIDPS_NEXUS"
    
#     POSTGRES_SERVER: str
#     POSTGRES_USER: str
#     POSTGRES_PASSWORD: str
#     POSTGRES_DB: str
#     SQLALCHEMY_DATABASE_URI: str | None = None

#     REDIS_URL: str
    
#     NETWORK_INTERFACE: str = "eth0"
#     SIMULATION_MODE: bool = True

#     class Config:
#         env_file = ".env"
#         case_sensitive = True

# settings = Settings()


from pydantic_settings import BaseSettings
from pydantic import model_validator
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "IIDPS_NEXUS"

    # Security
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "iidps_user"
    POSTGRES_PASSWORD: str = "iidps_password"
    POSTGRES_DB: str = "iidps_db"
    SQLALCHEMY_DATABASE_URI: str | None = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Network
    NETWORK_INTERFACE: str = "eth0"
    SIMULATION_MODE: bool = True

    # ML
    MODEL_PATH: str = "backend/app/ml_engine/models/rf_model.pkl"
    DATASET_PATH: str = "datasets/CICIDS2017"

    # Google Safe Browsing
    GOOGLE_SAFE_BROWSING_API_KEY: str = ""

    @model_validator(mode="after")
    def build_db_uri(self):
        if self.SQLALCHEMY_DATABASE_URI is None:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{self.POSTGRES_USER}:"
                f"{self.POSTGRES_PASSWORD}@"
                f"{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
            )
        return self

    class Config:
        env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"          # ← silently ignores any unrecognised .env vars

settings = Settings()