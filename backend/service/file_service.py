import os, shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"

def save_files(images: list[UploadFile], policy_pdf: UploadFile) -> tuple:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save policy PDF
    policy_path = f"{UPLOAD_DIR}/{policy_pdf.filename}"
    with open(policy_path, "wb") as f:
        shutil.copyfileobj(policy_pdf.file, f)
    
    # Save images
    image_paths = []
    for img in images:
        path = f"{UPLOAD_DIR}/{img.filename}"
        with open(path, "wb") as f:
            shutil.copyfileobj(img.file, f)
        image_paths.append(path)
    
    return image_paths, policy_path