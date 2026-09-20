@echo off
echo Starting CampusBite AI...

echo Starting FastAPI Backend...
start cmd /k "cd backend && call .\venv\Scripts\activate.bat && uvicorn backend.main:app --reload --port 8000"

echo Starting Vite React Frontend...
start cmd /k "set PATH=%PATH%;C:\Program Files\nodejs& cd frontend && npm run dev"

echo Both servers are starting up. Watch the consoles for logs.
