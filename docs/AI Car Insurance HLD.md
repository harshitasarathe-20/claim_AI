# High-Level Design - AI Car Insurance Claim Processing

## Architecture Philosophy

- **Keep it simple:** Modular Monolith, direct method calls, two views.
- **No microservices:** No REST between internal modules.
- **Goal:** Ship a working demo in 2-3 days.

## Architecture Diagram

```
|                   Browser UI                    |
|  -------------------     --------------------   |
|  | Customer Portal |     | Provider Dashboard|  |
|  | - Upload photos |     | - View all claims |  |
|  | - Enter claim   |     | - AI verdict +    |  |
|  |   info          |     |   report          |  |
|  | - See coverage  |     | - Approve/Reject  |  |
|  |   est           |     |                   |  |
|  -------------------     --------------------   |
          | HTTP (file upload + form submit only) |
          v
|       FastAPI Layer (thin - routing only)       |
|  /submit  ->  ClaimController.submit_claim()    |
|  /claim   ->  ClaimController.get_claim()       |
|  /claims  ->  ClaimController.list_claims()     |
|  /action  ->  ClaimController.update_action()   |
          | Direct method calls
          v
      ----------------------------------
      |         ClaimController         |
      | Orchestrates the modules below  |
      ----------------------------------
          |               |               |
          v               v               v
| ClaimService | | FileService  | | AIService     |
| - save()     | | - save()     | | - analyse()   |
| - get()      | | - load()     | | - build_prompt|
| - list()     | | - delete()   | | - call_gpt4o()|
| - update()   |                | - parse_result |
       |                                  |
       v                                  v
 -------------                     ----------------
 | SQLite DB |                     | PolicyService |
 | (via ORM) |                     | - extract()   |
 -------------                     |   (PyMuPDF)   |
                                   ----------------
```

## Module Responsibilities

- **ClaimController:** Orchestration only, calls other services, returns results to UI.
- **ClaimService:** All DB operations for claims.
- **FileService:** Save uploaded images and PDFs to `/uploads`, return file paths.
- **PolicyService:** Extract plain text from policy PDF using PyMuPDF.
- **AIService:** Build prompt, call GPT-4o, parse and return structured JSON result.

## Claim Submission Call Flow

1. **POST /submit** (FastAPI)
2. `ClaimController.submit_claim(form_data, images, policy_pdf)`
3. `FileService.save(images, policy_pdf)` → returns image_paths[], policy_path
4. `ClaimService.save(claim_data, image_paths, policy_path)` → returns claim_id (status = PENDING)
5. `PolicyService.extract(policy_path)` → returns policy_text
6. `AIService.analyse(claim_data, policy_text, image_paths)` → returns structured AIResult
7. `ClaimService.save_ai_result(claim_id, AIResult)` (status = ANALYSED)

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Python FastAPI
- **AI Model:** OpenAI GPT-4o
- **PDF Parse:** PyMuPDF (fitz)
- **Database:** SQLite
- **File Store:** Local `/uploads` folder
- **ORM:** SQLAlchemy

## Folder Structure

```
/app
  /controller
    claim_controller.py
  /service
    claim_service.py
    file_service.py
    policy_service.py
    ai_service.py
  /model
    claim.py
    ai_result.py
  /db
    database.py
  main.py
/uploads
/frontend
```

## Database Schema (Minimal)

**Table: claims**
- id (UUID, primary key)
- submitted_at (Timestamp)
- customer_name
- claim_amount
- damage_desc
- status (PENDING / ANALYSED / APPROVED / REJECTED)
- policy_path
- image_paths (comma-separated)

**Table: ai_results**
- id (UUID, primary key)
- claim_id (foreign key)
- damage_location
- impact_direction
- speed_range
- collision_type
- severity
- fraud_risk
- confidence_score
- observations
- recommended_action
- raw_response

## Key Design Decisions

- No REST between internal modules.
- FastAPI only for UI ↔ Backend boundary.
- Plain Python services.
- Controller holds no business logic.
- SQLite for MVP.

## Day-by-Day Build Plan

- **Day 1:** Setup FastAPI + SQLite + file upload. Integrate GPT-4o.
- **Day 2:** Build React UI - Customer form, Provider dashboard, AI verdict display.
- **Day 3:** Polish UI, status badges, error handling, presentation.

## What to Skip for Hackathon

- Authentication/Login
- Cloud Storage
- Microservices
- Real Policy Database
- Payment/Core Integration

## Future Enhancements

- Replace SQLite with PostgreSQL
- Add user authentication
- Move storage to cloud
- Async AI processing
- Integrate repair cost APIs
- Expand to other insurance types

---

Version 1.0 | Prepared for AI Hackathon MVP