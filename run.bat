@echo off
echo ====================================================================
echo               Starting GlassBox AI Studio & Runtime
echo ====================================================================
echo.
echo [1/2] Starting GlassBox FastAPI Backend on port 8000...
start "GlassBox-Backend" cmd /k "cd server && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting GlassBox React + Vite Frontend on port 3000...
start "GlassBox-Frontend" cmd /k "cd client && npm run dev"

echo.
echo ====================================================================
echo GlassBox AI is now running!
echo • Frontend Studio:  http://localhost:3000
echo • Backend API:      http://127.0.0.1:8000
echo • API Docs:         http://127.0.0.1:8000/docs
echo ====================================================================
