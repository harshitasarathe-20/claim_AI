@echo off
echo Starting ClaimAI backend...
set PYTHONDONTWRITEBYTECODE=1
cd backend
call ..\venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause