from app.service import (
    file_service,
    policy_service,
    ai_service
)

from app.model.claim import (
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

    # 1. Save uploaded files

    image_paths, policy_path = file_service.save_files(
        images,
        policy_pdf
    )

    # 2. Save claim to DB

    claim = Claim(
        customer_name=customer_name,
        customer_email=customer_email,
        claim_amount=float(claim_amount),
        damage_desc=damage_desc,
        policy_path=policy_path,
        image_paths=",".join(image_paths)
    )

    db.add(claim)
    db.commit()
    db.refresh(claim)

    # 3. Extract policy text

    policy_text = policy_service.extract_text(
        policy_path
    )

    # 4. Run AI analysis
    # Merged:
    # - your branch policy_path support
    # - main branch structure compatibility

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

    # 5. Save AI result

    ai_result = AIResult(
        claim_id=claim.id,
        **ai_result_data
    )

    db.add(ai_result)

    # Update claim status

    claim.status = "ANALYSED"

    db.commit()

    return {
        "claim_id": claim.id,
        "ai_result": ai_result_data
    }