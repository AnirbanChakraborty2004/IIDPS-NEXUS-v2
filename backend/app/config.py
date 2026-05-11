from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "IIDPS_NEXUS"
    
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: str | None = None

    REDIS_URL: str
    
    NETWORK_INTERFACE: str = "eth0"
    SIMULATION_MODE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
