import os
import time
import json
import base64
import json as jsonlib

from dotenv import load_dotenv

# Load .env before creating clients
load_dotenv()

from google import genai
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI


# ── TOON helpers ─────────────────────────────────────────────────────────────

def to_toon(data: dict, prefix: str = "") -> str:
    """Convert dict to TOON pipe-separated string."""
    parts = []

    for key, value in data.items():

        full_key = f"{prefix}.{key}" if prefix else key

        if isinstance(value, dict):

            parts.append(to_toon(value, prefix=full_key))

        elif isinstance(value, list):

            if len(value) == 0:

                parts.append(f"{full_key}:")

            elif isinstance(value[0], dict):

                for i, item in enumerate(value):
                    parts.append(
                        to_toon(item, prefix=f"{full_key}[{i}]")
                    )

            else:

                parts.append(
                    f"{full_key}:{','.join(str(v) for v in value)}"
                )

        elif value is None:

            parts.append(f"{full_key}:null")

        elif isinstance(value, bool):

            parts.append(
                f"{full_key}:{'true' if value else 'false'}"
            )

        else:

            parts.append(f"{full_key}:{value}")

    return "|".join(parts)


def from_toon(toon_string: str) -> dict:
    """Convert TOON string back to Python dict."""

    result = {}

    if not toon_string or not toon_string.strip():
        return result

    for pair in toon_string.strip().split("|"):

        if ":" not in pair:
            continue

        key, _, value = pair.partition(":")

        key = key.strip()
        value = value.strip()

        if value == "null":

            result[key] = None

        elif value == "true":

            result[key] = True

        elif value == "false":

            result[key] = False

        elif value.isdigit():

            result[key] = int(value)

        else:

            try:
                result[key] = float(value)

            except ValueError:
                result[key] = value

    return result


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

            print(
                f"[WARNING] Failed to upload image {path}: {e}"
            )

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

    print(f"\n[TOON] Prompt token savings:")
    print(f"  JSON size : {json_size} chars")
    print(f"  TOON size : {toon_size} chars")
    print(f"  Saved     : {percent}% (~{round(saved/4)} tokens)\n")

    # ── Prompt ──────────────────────────────────────────────────────────────

    prompt = f"""
You are an expert car insurance claims analyst.
Analyse the attached policy document and the damage photos provided.

CLAIM DETAILS:
- Customer: {claim_data['customer_name']}
- Claimed Amount: {claim_data['claim_amount']}
- Damage Description: {claim_data['damage_desc']}

TOON FORMAT VERSION (token optimized):
{claim_toon}

POLICY EXCERPT:
{policy_text[:2000]}

Respond ONLY with a valid JSON object.
No markdown.
No explanation.
No code fences.

{{
  "damage_location": "which part of the car is damaged",
  "impact_direction": "direction of impact",
  "severity": "Minor | Moderate | Severe | Total Loss",
  "collision_type": "type of collision",
  "fraud_risk": "Low | Medium | High",
  "confidence_score": 85,
  "observations": "detailed observations about damage and policy coverage",
  "recommended_action": "Approve | Investigate | Reject"
}}
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

        clean = (
            raw.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        parsed = json.loads(clean)

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

        return parsed

    except json.JSONDecodeError as e:

        print(
            f"[ai_service] JSON parse error: {e}\nRaw: {raw}"
        )

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

        print(
            f"[ai_service] Gemini invocation failed: {e}"
        )

        return MOCK_RESULT