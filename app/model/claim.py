from sqlalchemy import Column, String, Float, DateTime
from app.db.database import Base
import uuid, datetime

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    customer_name = Column(String)
    claim_amount = Column(Float)
    damage_desc = Column(String)
    status = Column(String, default="PENDING")
    policy_path = Column(String)
    image_paths = Column(String)  # comma-separated paths

class AIResult(Base):
    __tablename__ = "ai_results"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = Column(String)
    damage_location = Column(String)
    severity = Column(String)
    fraud_risk = Column(String)
    confidence_score = Column(Float)
    observations = Column(String)
    recommended_action = Column(String)
    raw_response = Column(String)