@echo off
echo Starting all servers...
echo.

echo [1/3] Starting FastAPI ML Server on port 8000...
start "FastAPI ML Server" cmd /k "cd ml-server && ..\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 5 /nobreak > nul

echo [2/3] Starting Express Backend on port 5000...
start "Express Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo [3/3] Starting React Frontend on port 3000...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo All servers starting...
echo ========================================
echo FastAPI:  http://localhost:8000
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to stop all servers...
pause > nul

taskkill /FI "WINDOWTITLE eq FastAPI ML Server*" /T /F
taskkill /FI "WINDOWTITLE eq Express Backend*" /T /F
taskkill /FI "WINDOWTITLE eq React Frontend*" /T /F
