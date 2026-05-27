import os
from urllib import response
from dotenv import load_dotenv
import requests
import json
from openai import OpenAI

load_dotenv()

HIVE_API_KEY = os.getenv("HIVE_API_KEY")
HIVE_BASE_URL = os.getenv("HIVE_BASE_URL", "https://api.thehive.ai/api/v3/")

if not HIVE_API_KEY:
    print("[WARNING] HIVE_API_KEY not set — Hive image detection will return mock data")
    hive_client = None
else:
    hive_client = OpenAI(base_url=HIVE_BASE_URL, api_key=HIVE_API_KEY)

MOCK_RESULT = {
    "description": "Mock image detection response — HIVE_API_KEY not configured.",
    "image_url": None,
    "raw_response": None,
    "detection": {
        "classes": None,
        "raw_response": None,
    },
}


def _detect_ai_generated_image(image_url: str) -> dict:
    """Call the Hive AI-generated image detection model."""
    HEADERS = {
        "Authorization": f"Bearer {HIVE_API_KEY}",
        "Content-Type": "application/json",
    }

    DETECTION_URL = "https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection"

    payload = json.loads('''{
        "input": [
            {
            "media_url": "https://thehive.ai/images/5d6a517.jpg"
            }
        ]
    }''')

    response = requests.post(
        DETECTION_URL,
        headers=HEADERS,
        json=payload,
        timeout=60
    )

    try:
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {
            "error": str(e),
            "response_text": response.text
        }


def detect_image_url(image_url: str, prompt: str = "Describe the scene in one sentence.") -> dict:
    """Detect image contents using Hive AI vision-language model and include AI-generation detection."""
    if hive_client is None:
        return {
            **MOCK_RESULT,
            "image_url": image_url,
            "prompt": prompt,
        }

    response = hive_client.chat.completions.create(
        model="hive/vision-language-model",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }],
        max_tokens=50,
    )

    content = None
    try:
        content = response.choices[0].message.content
    except Exception:
        content = None

    detection = _detect_ai_generated_image(image_url)

    return {
        "description": content,
        "image_url": image_url,
        "prompt": prompt,
        "detection": detection,
        "raw_response": response,
    }
