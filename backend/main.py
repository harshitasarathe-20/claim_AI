from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from controller import claim_controller
from model.claim import Claim, AIResult
from service.image_detection_service import detect_image_url
from service import imagekit_service
import shutil
import os

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
    claim_amount: str = Form(...),
    damage_desc: str = Form(...),
    images: list[UploadFile] = File(...),
    policy_pdf: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return claim_controller.submit_claim(db, customer_name, claim_amount, damage_desc, images, policy_pdf)


@app.post("/upload-imagekit")
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

    results = imagekit_service.upload_images(saved_paths)
    return {"uploaded": results}

class ImageDetectRequest(BaseModel):
    image_url: str
    prompt: str = "Describe the scene in one sentence."

@app.post("/detect-image")
def detect_image(request: ImageDetectRequest):
    return detect_image_url(request.image_url, request.prompt)

@app.get("/claims")
def list_claims(db: Session = Depends(get_db)):
    claims = db.query(Claim).all()
    results = []
    for c in claims:
        ai = db.query(AIResult).filter(AIResult.claim_id == c.id).first()
        results.append({**c.__dict__, "ai_result": ai.__dict__ if ai else None})
    return results