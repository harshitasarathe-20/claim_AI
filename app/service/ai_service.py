import os, base64, json
from openai import OpenAI

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyse(claim_data: dict, policy_text: str, image_paths: list[str]) -> dict:
    # Encode images to base64 for the API
    image_messages = []
    for path in image_paths[:5]:  # max 5 images
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        image_messages.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })

    prompt = f"""
You are an insurance claim analyser. Analyse the following claim and respond ONLY with a JSON object.

POLICY TEXT:
{policy_text[:3000]}

CLAIM DETAILS:
- Customer: {claim_data['customer_name']}
- Claimed Amount: {claim_data['claim_amount']}
- Damage Description: {claim_data['damage_desc']}

Analyse the photos and return this exact JSON:
{{
  "damage_location": "which part of car",
  "severity": "Minor/Moderate/Severe/Total Loss",
  "fraud_risk": "Low/Medium/High",
  "confidence_score": 85,
  "observations": "detailed observations here",
  "recommended_action": "Approve/Investigate/Reject"
}}
"""

    messages = [{"type": "text", "text": prompt}] + image_messages

    # HARDCODED RESPONSE FOR TESTING
    raw = """{
  "damage_location": "Front bumper and hood",
  "severity": "Moderate",
  "fraud_risk": "Low",
  "confidence_score": 88,
  "observations": "Clear collision damage to front-end. Paint transfer marks consistent with vehicle impact. No signs of deliberate damage. Repair estimate appears reasonable for damage severity.",
  "recommended_action": "Approve"
}"""

    # response = client.chat.completions.create(
    #     model="gpt-4o",
    #     messages=[{"role": "user", "content": messages}],
    #     max_tokens=1000
    # )

    # Strip markdown code fences if present
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)