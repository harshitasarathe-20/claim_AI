from fastapi import Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.controller import claim_controller
from app.model.claim import Claim, AIResult

@app.post("/submit")
async def submit_claim(
    customer_name: str = Form(...),
    claim_amount: str = Form(...),
    damage_desc: str = Form(...),
    images: list[UploadFile] = File(...),
    policy_pdf: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return claim_controller.submit_claim(db, customer_name, claim_amount, damage_desc, images, policy_pdf)

@app.get("/claims")
def list_claims(db: Session = Depends(get_db)):
    claims = db.query(Claim).all()
    results = []
    for c in claims:
        ai = db.query(AIResult).filter(AIResult.claim_id == c.id).first()
        results.append({**c.__dict__, "ai_result": ai.__dict__ if ai else None})
    return results