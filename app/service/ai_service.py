import os
import base64
import json as jsonlib
from dotenv import load_dotenv

# Must load .env before creating OpenAI client
load_dotenv()

from openai import OpenAI

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
                    parts.append(to_toon(item, prefix=f"{full_key}[{i}]"))
            else:
                parts.append(f"{full_key}:{','.join(str(v) for v in value)}")
        elif value is None:
            parts.append(f"{full_key}:null")
        elif isinstance(value, bool):
            parts.append(f"{full_key}:{'true' if value else 'false'}")
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


# ── OpenAI client setup ───────────────────────────────────────────────────────

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("[WARNING] OPENAI_API_KEY not set — AI will return mock data")
    client = None
else:
    client = OpenAI(api_key=api_key)


# ── Mock result (used when no API key) ───────────────────────────────────────

MOCK_RESULT = {
    "damage_location": "Front bumper",
    "impact_direction": "Head-on",
    "severity": "Moderate",
    "collision_type": "Single vehicle",
    "fraud_risk": "Low",
    "confidence_score": 75,
    "observations": "Mock result — OPENAI_API_KEY not configured in .env file",
    "recommended_action": "Investigate",
    "raw_response": "mock|data:true"
}


# ── Image helper ──────────────────────────────────────────────────────────────

def _encode_image(image_path: str) -> str:
    """Read image file and return base64 encoded string."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


# ── Prompt builder ────────────────────────────────────────────────────────────

def _build_prompt(claim_data: dict, policy_text: str) -> str:
    """Build token-efficient prompt using TOON format for claim data."""

    claim_toon = to_toon({
        "customer": claim_data["customer_name"],
        "amount":   claim_data["claim_amount"],
        "desc":     claim_data["damage_desc"]
    })

    response_format = (
        "damage_location:<value>|"
        "impact_direction:<value>|"
        "severity:<Minor/Moderate/Severe/Total Loss>|"
        "collision_type:<value>|"
        "fraud_risk:<Low/Medium/High>|"
        "confidence_score:<0-100>|"
        "observations:<text>|"
        "recommended_action:<Approve/Investigate/Reject>"
    )

    return f"""You are an expert car insurance claim analyser.

CLAIM DATA (TOON format):
{claim_toon}

POLICY EXCERPT:
{policy_text[:2000]}

INSTRUCTIONS:
1. Analyse the damage photos carefully
2. Cross-check photos against the claim description
3. Validate claimed amount against damage severity
4. Detect any fraud signals or inconsistencies
5. Respond ONLY in TOON format below — no JSON, no markdown, no extra text

RESPONSE FORMAT:
{response_format}"""


# ── Main analyse function ─────────────────────────────────────────────────────

def analyse(claim_data: dict, policy_text: str, image_paths: list) -> dict:
    """
    Analyse a car insurance claim using GPT-4o vision + TOON format.
    Returns a structured dict with damage assessment and fraud verdict.
    """

    # Return mock data if no API key is configured
    if client is None:
        print("[MOCK] Returning mock AI result — add OPENAI_API_KEY to .env")
        return MOCK_RESULT

    # Build prompt
    prompt = _build_prompt(claim_data, policy_text)

    # Encode images (max 5)
    image_messages = []
    for path in image_paths[:5]:
        try:
            b64 = _encode_image(path)
            image_messages.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}",
                    "detail": "high"
                }
            })
        except Exception as e:
            print(f"[WARNING] Could not encode image {path}: {e}")

    # Build message content — text first, then images
    content = [{"type": "text", "text": prompt}] + image_messages

    # Call GPT-4o
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            max_tokens=500,
            temperature=0.1
        )
        raw = response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[ERROR] GPT-4o call failed: {e}")
        return MOCK_RESULT

    # Parse TOON response to dict
    result = from_toon(raw)

    # Fill in any missing fields with safe defaults
    defaults = {
        "damage_location":  "Unknown",
        "impact_direction": "Unknown",
        "severity":         "Unknown",
        "collision_type":   "Unknown",
        "fraud_risk":       "Medium",
        "confidence_score": 50,
        "observations":     "Unable to determine from provided images",
        "recommended_action": "Investigate"
    }
    for field, default in defaults.items():
        if field not in result:
            result[field] = default

    # Ensure confidence_score is an integer
    try:
        result["confidence_score"] = int(result["confidence_score"])
    except (ValueError, TypeError):
        result["confidence_score"] = 50

    # Log TOON savings to console
    json_size  = len(jsonlib.dumps(claim_data))
    toon_size  = len(to_toon(claim_data))
    saved      = json_size - toon_size
    percent    = round((saved / json_size) * 100, 1) if json_size > 0 else 0

    print(f"\n[TOON] Prompt token savings:")
    print(f"  JSON size : {json_size} chars")
    print(f"  TOON size : {toon_size} chars")
    print(f"  Saved     : {percent}% (~{round(saved/4)} tokens)")
    print(f"  Response  : {raw}\n")

    result["raw_response"] = raw
    return result