import os
import time
import json
import base64
import json as jsonlib
from dotenv import load_dotenv

load_dotenv()

import logging

from google import genai
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from service.toon_service import to_toon, from_toon, token_savings

# Logger
logger = logging.getLogger(__name__)

# ── Mock result ──────────────────────────────────────────────────────────────

MOCK_RESULT = {
    "damage_location": "Front bumper",
    "impact_direction": "Head-on",
    "severity": "Moderate",
    "collision_type": "Single vehicle",
    "fraud_risk": "Low",
    "confidence_score": 75,
    "observations": "Mock result — GOOGLE_API_KEY not configured",
    "recommended_action": "Investigate",
    "raw_response": "mock|data:true"
}


# ── Optional helper from main ───────────────────────────────────────────────

def _encode_image(image_path: str) -> str:
    """Read image file and return base64 encoded string."""

    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


# ── Main analyse function ───────────────────────────────────────────────────

def analyse(
    claim_data: dict,
    policy_text: str,
    image_paths: list[str]
) -> dict:

    # Step 1: Create client
    # Reads GOOGLE_API_KEY automatically from .env

    client = genai.Client()

    # Step 2: Create model

    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash"
    )

    # Step 3: Upload policy PDF to Google servers

    policy_path = claim_data.get("policy_path", "")

    uploaded_policy = None

    if policy_path and os.path.exists(policy_path):

        uploaded_policy = client.files.upload(
            file=policy_path
        )

        # Step 4: Wait until processing completes

        while uploaded_policy.state.name == "PROCESSING":

            time.sleep(2)

            uploaded_policy = client.files.get(
                name=uploaded_policy.name
            )

    # Step 5: Upload images

    uploaded_images = []

    for path in image_paths[:5]:

        try:

            uploaded_img = client.files.upload(
                file=path
            )

            while uploaded_img.state.name == "PROCESSING":

                time.sleep(2)

                uploaded_img = client.files.get(
                    name=uploaded_img.name
                )

            uploaded_images.append(uploaded_img)

        except Exception as e:

            logger.warning("Failed to upload image %s: %s", path, e)

    # ── TOON analytics ──────────────────────────────────────────────────────

    claim_toon = to_toon({
        "customer": claim_data["customer_name"],
        "amount": claim_data["claim_amount"],
        "desc": claim_data["damage_desc"]
    })

    json_size = len(jsonlib.dumps(claim_data))
    toon_size = len(claim_toon)

    saved = json_size - toon_size

    percent = (
        round((saved / json_size) * 100, 1)
        if json_size > 0 else 0
    )

    logger.info("[TOON] Prompt token savings: JSON=%s chars, TOON=%s chars, Saved=%s%% (~%s tokens)", json_size, toon_size, percent, round(saved/4))

    # ── Prompt ──────────────────────────────────────────────────────────────

    # Instruct model to respond in TOON format (compact token-optimized),
    # then decode back to JSON using `from_toon`.
    prompt = f"""
You are an expert car insurance claims analyst.
Analyse the attached policy document and the damage photos provided.

CLAIM DETAILS (TOON):
{claim_toon}

POLICY EXCERPT:
{policy_text[:2000]}

Respond ONLY in TOON format representing a mapping with the following keys:
- damage_location
- impact_direction
- severity (Minor | Moderate | Severe | Total Loss)
- collision_type
- fraud_risk (Low | Medium | High)
- confidence_score (numeric)
- observations
- recommended_action (Approve | Investigate | Reject)

Do NOT include any markdown, explanations, or code fences.
"""

    # ── Build content ───────────────────────────────────────────────────────

    content = [
        {
            "type": "text",
            "text": prompt
        }
    ]

    # Add policy PDF

    if uploaded_policy:

        content.append({
            "type": "file",
            "file_id": uploaded_policy.uri,
            "mime_type": "application/pdf",
        })

    # Add uploaded images

    for uploaded_img in uploaded_images:

        ext = uploaded_img.name.lower().split(".")[-1]

        mime = (
            "image/png"
            if ext == "png"
            else "image/jpeg"
        )

        content.append({
            "type": "file",
            "file_id": uploaded_img.uri,
            "mime_type": mime,
        })

    # Step 6: Create HumanMessage and invoke Gemini

    message = HumanMessage(content=content)

    try:

        response = model.invoke([message])

        # Step 7: Parse response

        raw = (
            response.text
            if hasattr(response, "text")
            else str(response.content)
        )

        logger.debug("AI raw response length: %d", len(str(raw)))

        # Try TOON decode first
        parsed = from_toon(raw)

        if parsed:
            logger.info("Parsed response via TOON with keys: %s", list(parsed.keys()))

        # Fallback: if TOON decode failed, try stripping code fences and parse JSON
        if not parsed:
            clean = (
                raw.replace("```json", "")
                .replace("```", "")
                .strip()
            )
            try:
                parsed = json.loads(clean)
                logger.info("Parsed response via JSON fallback with keys: %s", list(parsed.keys()))
            except Exception:
                parsed = {}

        # Add raw response

        parsed["raw_response"] = raw

        # Safe defaults

        defaults = {
            "damage_location": "Unknown",
            "impact_direction": "Unknown",
            "severity": "Unknown",
            "collision_type": "Unknown",
            "fraud_risk": "Medium",
            "confidence_score": 50,
            "observations":
                "Unable to determine from provided images",
            "recommended_action": "Investigate"
        }

        for field, default in defaults.items():

            if field not in parsed:
                parsed[field] = default

        # Ensure confidence_score integer

        try:

            parsed["confidence_score"] = int(
                parsed["confidence_score"]
            )

        except (ValueError, TypeError):

            parsed["confidence_score"] = 50

        logger.info("Final parsed AI result: damage_location=%s impact_direction=%s severity=%s confidence=%s recommended_action=%s", parsed.get("damage_location"), parsed.get("impact_direction"), parsed.get("severity"), parsed.get("confidence_score"), parsed.get("recommended_action"))
        return parsed

    except json.JSONDecodeError as e:

        logger.error("JSON parse error: %s — Raw start: %s", e, str(raw)[:300])

        return {
            "damage_location": "Unable to determine",
            "impact_direction": "Unknown",
            "collision_type": "Unknown",
            "severity": "Unknown",
            "fraud_risk": "Medium",
            "confidence_score": 0,
            "observations":
                f"AI response could not be parsed. Raw: {raw[:300]}",
            "recommended_action": "Investigate",
            "raw_response": raw
        }

    except Exception as e:

        logger.exception("Gemini invocation failed: %s", e)

        return MOCK_RESULT