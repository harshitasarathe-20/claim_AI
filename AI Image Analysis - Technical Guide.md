# AI Image Analysis - Technical Guide for Car Insurance Claim Processing

## Purpose

Guide for development team on AI image analysis, model selection, and integration for car insurance claims.

## What the AI Can Analyse from Damage Photos

### High Confidence Analyses

1. **Damage Location:** Which part of the car is damaged (front, rear, left, right, roof).
2. **Impact Direction:** How the vehicle was hit (head-on, rear-end, side).
3. **Impact Point:** Exact panel or zone (bumper, door, fender, hood).
4. **Damage Severity:** Minor / Moderate / Severe / Total Loss.

### Medium Confidence Analyses

5. **Collision Type:** Single vehicle, multi-vehicle, rollover, stationary object.
6. **Rollover/Flip Detection:** Roof crush and pillar damage.
7. **Airbag Deployment:** Visible deployed airbags in interior photos.

### Indicative Only

8. **Approximate Speed Range:** Very Low / Low / Medium / High / Severe (not forensically accurate).

#### Speed/Severity Inference

| Damage Pattern                | Inferred Speed Range      |
|------------------------------|--------------------------|
| Surface scratches only        | Very Low (<10 km/h)      |
| Panel dents only              | Low (10-30 km/h)         |
| Crumple zone engaged          | Medium (30-60 km/h)      |
| Frame bent/heavy deformation  | High (60-100 km/h)       |
| Cabin intrusion/collapse      | Severe (>100 km/h)       |

## Use Case: Fraud Detection & Claim Validation

- **Fraud Detection:** AI flags inconsistencies (e.g., severe damage for low-speed claim).
- **Coverage Estimation:** Maps damage to policy clauses for payout estimation.

## Recommended AI Models & Tools

### Option 1: Vision LLMs (Recommended for MVP)

| Model            | Provider   | Strength                    |
|------------------|------------|-----------------------------|
| GPT-4o           | OpenAI     | Best multimodal reasoning   |
| Gemini 1.5 Pro   | Google     | Strong image+doc analysis   |
| Claude 3.5 Sonnet| Anthropic  | Strong reasoning/policy     |

### Option 2: Specialized Vision Models

| Tool             | Purpose                        |
|------------------|-------------------------------|
| AWS Rekognition  | Object/scene detection         |
| Google Vision AI | Label detection/localisation   |
| Roboflow + YOLO  | Custom damage segmentation     |
| Azure AI Vision  | Damage area detection          |

## Integration Steps

1. **Accept Image Input:** JPEG/PNG uploads, 3-5 images recommended.
2. **Prepare the Prompt:**  
   - Fraud detection: Ask for damage location, impact, speed, severity, fraud risk, action.
   - Coverage estimator: Map damage to policy, estimate payout, explain uncovered damages.
3. **Call the API:**  
   - Example: OpenAI GPT-4o or Google Gemini 1.5 Pro.
4. **Return Structured JSON:**  
   ```json
   {
     "damage_location": "",
     "impact_direction": "",
     "speed_range": "",
     "collision_type": "",
     "severity": "",
     "fraud_risk": "",
     "confidence_score": 0-100,
     "recommended_action": ""
   }
   ```
5. **Store & Display Result:**  
   - Store analysis with claim records.
   - Show fraud verdict on provider dashboard.
   - Show payout estimation on customer portal.

## Suggested Tech Stack for MVP

| Layer        | Technology                  |
|--------------|----------------------------|
| Backend API  | Python FastAPI / Java Spring|
| AI / LLM     | GPT-4o / Gemini 1.5 Pro    |
| Storage      | AWS S3 / Azure Blob        |
| PDF Parsing  | PyMuPDF / Apache PDFBox    |
| Frontend     | React / Angular            |
| Database     | PostgreSQL                 |

### Multiple Image Recommendation

| Number of Images | Analysis Quality |
|------------------|-----------------|
| 1 image          | Basic           |
| 2-3 images       | Good            |
| 4-5 images       | Best            |

**Recommended:** Front, rear, and close-up of damaged area.

## Limitations

- Speed estimation is indicative only.
- AI verdict is not a legal decision.
- Low-quality images reduce accuracy.
- Always show confidence scores.

---

Version 1.0 | Prepared for Development Team - AI Hackathon MVP