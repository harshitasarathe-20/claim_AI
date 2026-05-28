from service import (
    file_service,
    policy_service,
    ai_service
)
from service import imagekit_service, image_detection_service

import logging

logger = logging.getLogger(__name__)

from model.claim import (
    Claim,
    AIResult
)

from sqlalchemy.orm import Session


def submit_claim(
    db: Session,
    customer_name,
    customer_email,
    claim_amount,
    damage_desc,
    images,
    policy_pdf
):

    logger.info("submit_claim: start - customer=%s email=%s amount=%s", customer_name, customer_email, claim_amount)

    # 1. Save uploaded files
    try:
        image_paths, policy_path = file_service.save_files(images, policy_pdf)
        logger.info("submit_claim: files saved - images=%s policy=%s", image_paths, policy_path)
    except Exception as e:
        logger.exception("submit_claim: failed saving files: %s", e)
        raise

    # 2. Save claim to DB

    claim = Claim(
        customer_name=customer_name,
        customer_email=customer_email,
        claim_amount=float(claim_amount),
        damage_desc=damage_desc,
        policy_path=policy_path,
        image_paths=",".join(image_paths)
    )

    try:
        db.add(claim)
        db.commit()
        db.refresh(claim)
        logger.info("submit_claim: claim saved to DB - id=%s", claim.id)
    except Exception as e:
        logger.exception("submit_claim: DB commit failed: %s", e)
        db.rollback()
        raise

    # 3. Extract policy text

    try:
        policy_text = policy_service.extract_text(policy_path)
        logger.info("submit_claim: policy text extracted (chars=%d)", len(policy_text) if policy_text else 0)
    except Exception as e:
        logger.exception("submit_claim: policy extraction failed: %s", e)
        raise

    # 4. Upload images to ImageKit and run image detection on their URLs
    try:
        uploaded = imagekit_service.upload_images(image_paths)
        uploaded_urls = [u.get("url") for u in uploaded if u.get("url")]
        logger.info("submit_claim: uploaded images to ImageKit - urls=%s", uploaded_urls)

        # Run image detection for each uploaded URL and log the results
        for url in uploaded_urls:
            try:
                detection = image_detection_service.detect_image_url(url)

                # Extract concise summary: description + ai_generated / not_ai_generated scores
                desc = detection.get("description") if isinstance(detection, dict) else None

                ai_score = None
                not_ai_score = None

                det = detection.get("detection") if isinstance(detection, dict) else None
                if isinstance(det, dict):
                    outputs = det.get("output") or det.get("outputs") or []
                    if outputs and isinstance(outputs, list):
                        # look for classes array in first output entry (robustly scan all)
                        for out in outputs:
                            classes = out.get("classes") if isinstance(out, dict) else None
                            if classes and isinstance(classes, list):
                                for c in classes:
                                    try:
                                        cname = c.get("class")
                                        cval = c.get("value")
                                    except Exception:
                                        continue
                                    if cname == "ai_generated" and ai_score is None:
                                        ai_score = cval
                                    if cname == "not_ai_generated" and not_ai_score is None:
                                        not_ai_score = cval

                # Normalize None -> 0.0 for logging
                ai_score = float(ai_score) if ai_score is not None else 0.0
                not_ai_score = float(not_ai_score) if not_ai_score is not None else 0.0

                logger.info(
                    "submit_claim: image detection summary for %s: description=%s ai_generated=%.4f not_ai_generated=%.4f",
                    url, desc, ai_score, not_ai_score
                )

                print(f"Image detection summary for {url}: description={desc} ai_generated={ai_score} not_ai_generated={not_ai_score}")
            except Exception as e:
                logger.exception("submit_claim: image detection failed for %s: %s", url, e)
    except Exception as e:
        logger.exception("submit_claim: image upload/detection step failed: %s", e)
        # Continue to AI analysis even if detection fails

    # 5. Run AI analysis
    try:
        logger.info("submit_claim: invoking AI analysis for claim id=%s", claim.id)
        ai_result_data = ai_service.analyse(
            {
                "customer_name": customer_name,
                "claim_amount": claim_amount,
                "damage_desc": damage_desc,
                "policy_path": policy_path
            },
            policy_text,
            image_paths
        )
        logger.info("submit_claim: AI analysis completed for claim id=%s", claim.id)
    except Exception as e:
        logger.exception("submit_claim: AI analysis failed: %s", e)
        raise

    # 5. Save AI result

    ai_result = AIResult(
        claim_id=claim.id,
        **ai_result_data
    )

    try:
        db.add(ai_result)
        claim.status = "ANALYSED"
        db.commit()
        logger.info("submit_claim: AI result saved and claim status updated - claim id=%s", claim.id)
    except Exception as e:
        logger.exception("submit_claim: saving AI result failed: %s", e)
        db.rollback()
        raise

    return {
        "claim_id": claim.id,
        "ai_result": ai_result_data
    }