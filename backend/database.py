from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

# Using the docker-compose credentials
DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URI", "postgresql://iidps_user:iidps_password@localhost:5432/iidps_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    ip = Column(String, index=True)
    target = Column(String, default="Local System")
    time = Column(DateTime, default=datetime.utcnow)
    severity = Column(String)
    action = Column(String, default="Logged")
    confidence = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
