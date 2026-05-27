from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.database import get_db
from controller import claim_controller
from model.claim import Claim, AIResult
from pydantic import BaseModel

class ActionRequest(BaseModel):
    claim_id: str
    action: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/submit")
async def submit_claim(
    customer_name: str = Form(...),
    customer_email: str = Form(...),
    claim_amount: str = Form(...),
    damage_desc: str = Form(...),
    images: list[UploadFile] = File(...),
    policy_pdf: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return claim_controller.submit_claim(db, customer_name, customer_email, claim_amount, damage_desc, images, policy_pdf)

@app.get("/claims")
def list_claims(db: Session = Depends(get_db)):
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
    hours_saved = (analysed_claims + approved_claims) * 0.5
    
    return {
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "analysed_claims": analysed_claims,
        "approved_claims": approved_claims,
        "fraud_claims": fraud_claims,
        "money_saved": money_saved,
        "hours_saved": hours_saved
    }