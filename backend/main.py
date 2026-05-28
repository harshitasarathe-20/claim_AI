from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from controller import claim_controller
from model.claim import Claim, AIResult
from pydantic import BaseModel
from db import database
import logging


# Configure root logger for the application
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s"
)
logger = logging.getLogger("claim_ai")

class ActionRequest(BaseModel):
    claim_id: str
    action: str
from service.image_detection_service import detect_image_url
from service import imagekit_service
import shutil
import os
from sqlalchemy import text

app = FastAPI(
    title="Claim AI",
    description="Backend APIs for processing Insurance Claims with AI Analysis and Image handling.",
    version="2026.5.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    logger.info("Application startup: ensuring database tables exist")
    # Ensure all tables are created when the app starts
    database.Base.metadata.create_all(bind=database.engine)
    logger.info("Database tables ensured")
    # Ensure new columns exist in existing SQLite tables (safe ALTER TABLE)
    try:
        with database.engine.connect() as conn:
            # ai_results needs 'impact_direction' and 'collision_type'
            info = conn.execute(text("PRAGMA table_info('ai_results');")).mappings().all()
            existing = {row['name'] for row in info}
            if 'impact_direction' not in existing:
                logger.info("Adding missing column 'impact_direction' to ai_results table")
                conn.execute(text("ALTER TABLE ai_results ADD COLUMN impact_direction TEXT;"))
            if 'collision_type' not in existing:
                logger.info("Adding missing column 'collision_type' to ai_results table")
                conn.execute(text("ALTER TABLE ai_results ADD COLUMN collision_type TEXT;"))
    except Exception as e:
        logger.warning("Failed to ensure ai_results columns: %s", e)


@app.on_event("shutdown")
def shutdown_event():
    logger.info("Application shutdown")

@app.post("/submit", tags=["Claims"])
async def submit_claim(
    customer_name: str = Form(...),
    customer_email: str = Form(...),
    claim_amount: str = Form(...),
    damage_desc: str = Form(...),
    images: list[UploadFile] = File(...),
    policy_pdf: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    logger.info("API /submit called: customer=%s amount=%s images=%d", customer_name, claim_amount, len(images) if images else 0)
    return claim_controller.submit_claim(db, customer_name, customer_email, claim_amount, damage_desc, images, policy_pdf)


@app.post("/upload-imagekit", tags=["Image Upload"])
async def upload_imagekit(images: list[UploadFile] = File(...)):
    """Upload provided files to ImageKit via `imagekit_service.upload_images`.

    Use `multipart/form-data` with multiple `images` fields in Swagger / OpenAPI UI.
    """
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    saved_paths = []
    for img in images:
        dest = f"{UPLOAD_DIR}/{img.filename}"
        with open(dest, "wb") as f:
            shutil.copyfileobj(img.file, f)
        saved_paths.append(dest)

    logger.info("API /upload-imagekit called: files=%d", len(saved_paths))
    results = imagekit_service.upload_images(saved_paths)
    logger.info("API /upload-imagekit completed: uploaded=%d", len(results) if results else 0)
    return {"uploaded": results}

class ImageDetectRequest(BaseModel):
    image_url: str
    prompt: str = "Describe the scene in one sentence."

@app.post("/detect-image", tags=["Image Detection"])
def detect_image(request: ImageDetectRequest):
    logger.info("API /detect-image called: url=%s", request.image_url)
    return detect_image_url(request.image_url, request.prompt)

@app.get("/claims", tags=["Claims"])
def list_claims(db: Session = Depends(get_db)):
    logger.info("API /claims called: listing claims")
    claims = db.query(Claim).all()
    results = []
    for c in claims:
        ai = db.query(AIResult).filter(AIResult.claim_id == c.id).first()
        results.append({**c.__dict__, "ai_result": ai.__dict__ if ai else None})
    return results

@app.post("/action")
def update_claim_action(request: ActionRequest, db: Session = Depends(get_db)):
    claim_id = request.claim_id
    action = request.action
    
    logger.info("API /action called: claim_id=%s action=%s", request.claim_id, request.action)
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        return {"error": "Claim not found"}
    
    # Map action to status
    status_map = {
        "Approve": "APPROVED",
        "Reject": "REJECTED",
        "Investigate": "PENDING"  # Keep as pending while investigating
    }
    
    claim.status = status_map.get(action, claim.status)
    db.commit()
    
    return {"success": True, "claim_id": claim_id, "new_status": claim.status}

@app.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    logger.info("API /metrics called")
    all_claims = db.query(Claim).all()
    
    # Calculate metrics
    total_claims = len(all_claims)
    pending_claims = len([c for c in all_claims if c.status == "PENDING"])
    analysed_claims = len([c for c in all_claims if c.status == "ANALYSED"])
    approved_claims = len([c for c in all_claims if c.status == "APPROVED"])
    
    # Calculate fraud claims (High fraud risk) and money saved
    fraud_claims = 0
    money_saved = 0.0
    
    for claim in all_claims:
        ai = db.query(AIResult).filter(AIResult.claim_id == claim.id).first()
        if ai and ai.fraud_risk == "High":
            fraud_claims += 1
            money_saved += claim.claim_amount
    
    # Calculate human hours saved (estimate: 30 mins per claim analyzed)
    hours_saved = (analysed_claims + approved_claims + fraud_claims) * 2
    
    return {
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "analysed_claims": analysed_claims,
        "approved_claims": approved_claims,
        "fraud_claims": fraud_claims,
        "money_saved": money_saved,
        "hours_saved": hours_saved
    }