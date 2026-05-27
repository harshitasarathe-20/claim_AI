import os
import time
import json
from google import genai
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI


def analyse(claim_data: dict, policy_text: str, image_paths: list[str]) -> dict:

    # Step 1: Create client (reads GOOGLE_API_KEY from .env automatically)
    client = genai.Client()

    # Step 2: Create model
    model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

    # Step 3: Upload policy PDF to Google's servers
    policy_path = claim_data.get("policy_path", "")
    uploaded_policy = client.files.upload(file=policy_path)

    # Step 4: Wait for it to finish processing (exact same while loop as docs)
    while uploaded_policy.state.name == "PROCESSING":
        time.sleep(2)
        uploaded_policy = client.files.get(name=uploaded_policy.name)

    # Step 5: Upload each damage image the same way
    uploaded_images = []
    for path in image_paths[:5]:
        uploaded_img = client.files.upload(file=path)
        while uploaded_img.state.name == "PROCESSING":
            time.sleep(2)
            uploaded_img = client.files.get(name=uploaded_img.name)
        uploaded_images.append(uploaded_img)

    # Step 6: Build the message content (exact same structure as docs)
    #         - text block first
    #         - then file blocks (policy PDF + images)

    prompt = f"""
You are an expert car insurance claims analyst.
Analyse the attached policy document and the damage photos provided.

CLAIM DETAILS:
- Customer: {claim_data['customer_name']}
- Claimed Amount: {claim_data['claim_amount']}
- Damage Description: {claim_data['damage_desc']}

Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.

{{
  "damage_location": "which part of the car is damaged",
  "severity": "Minor | Moderate | Severe | Total Loss",
  "fraud_risk": "Low | Medium | High",
  "confidence_score": 85,
  "observations": "detailed observations about damage and policy coverage",
  "recommended_action": "Approve | Investigate | Reject"
}}
"""

    content = [
        # Text prompt (same as {"type": "text", "text": "What is in the document?"})
        {"type": "text", "text": prompt},

        # Policy PDF (same as the file block in docs)
        {
            "type": "file",
            "file_id": uploaded_policy.uri,
            "mime_type": "application/pdf",
        },
    ]

    # Add each uploaded image as a file block (same pattern, different mime_type)
    for uploaded_img in uploaded_images:
        ext = uploaded_img.name.lower().split(".")[-1]
        mime = "image/png" if ext == "png" else "image/jpeg"
        content.append({
            "type": "file",
            "file_id": uploaded_img.uri,
            "mime_type": mime,
        })

    # Step 7: Create HumanMessage and invoke (exact same as docs)
    message = HumanMessage(content=content)
    response = model.invoke([message])


    # Step 8: Parse the response
    raw = response.text if hasattr(response, "text") else str(response.content)
    clean = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(clean)
    except json.JSONDecodeError as e:
        print(f"[ai_service] JSON parse error: {e}\nRaw: {raw}")
        return {
            "damage_location": "Unable to determine",
            "severity": "Unknown",
            "fraud_risk": "Medium",
            "confidence_score": 0,
            "observations": f"AI response could not be parsed. Raw: {raw[:300]}",
            "recommended_action": "Investigate"
        }