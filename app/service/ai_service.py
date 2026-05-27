import os
import base64
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

def analyse(claim_data: dict, policy_text: str, image_paths: list[str]) -> dict:
    # Build image content blocks
    content = []

    # Add text prompt first
    prompt = f"""
You are an expert car insurance claims analyst. Analyse the following claim carefully and respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.

POLICY TEXT (first 3000 chars):
{policy_text[:3000]}

CLAIM DETAILS:
- Customer: {claim_data['customer_name']}
- Claimed Amount: {claim_data['claim_amount']}
- Damage Description: {claim_data['damage_desc']}

Analyse all provided damage photos and return ONLY this exact JSON structure:
{{
  "damage_location": "which part of the car is damaged",
  "severity": "Minor | Moderate | Severe | Total Loss",
  "fraud_risk": "Low | Medium | High",
  "confidence_score": 85,
  "observations": "detailed multi-sentence observations about damage, consistency with description, and policy coverage",
  "recommended_action": "Approve | Investigate | Reject"
}}
"""
    content.append({"type": "text", "text": prompt})

    # Add images (max 5)
    for path in image_paths[:5]:
        try:
            with open(path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            # Detect mime type from extension
            ext = path.lower().split(".")[-1]
            mime = "image/png" if ext == "png" else "image/jpeg"
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime};base64,{b64}"}
            })
        except Exception as e:
            print(f"[ai_service] Could not load image {path}: {e}")

    # Initialise the model
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.2,      # Low temp for consistent structured output
        max_tokens=1000,
    )

    # Call the model
    message = HumanMessage(content=content)
    response = llm.invoke([message])
    raw = response.content

    # Strip markdown fences if model wraps response anyway
    clean = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(clean)
    except json.JSONDecodeError as e:
        print(f"[ai_service] JSON parse error: {e}\nRaw response: {raw}")
        # Return a safe fallback so the claim isn't lost
        return {
            "damage_location": "Unable to determine",
            "severity": "Unknown",
            "fraud_risk": "Medium",
            "confidence_score": 0,
            "observations": f"AI response could not be parsed. Raw: {raw[:300]}",
            "recommended_action": "Investigate"
        }