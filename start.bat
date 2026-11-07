@echo off
title Reunite - Launcher
color 0B
echo ======================================================================
echo                  REUNITE - LOST ^& FOUND PLATFORM
echo ======================================================================
echo.

:: 1. Check & start MongoDB service if needed
echo [1/3] Checking MongoDB Service...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo       [OK] MongoDB service is active.
) else (
    echo       [!] Note: If MongoDB is not a registered service, ensure
    echo           mongod is running on port 27017.
)
echo.

:: 2. Launch Django Backend Server
echo [2/3] Starting Django Backend on http://127.0.0.1:8000 ...
start "Reunite - Backend (Django)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"
echo       [OK] Backend window launched.
echo.

:: 3. Launch Vite Frontend Dev Server
echo [3/3] Starting React Frontend on http://localhost:5173 ...
start "Reunite - Frontend (Vite/React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo       [OK] Frontend window launched.
echo.

:: 4. Launch Web Browser
echo Opening Chrome to http://localhost:5173 in 3 seconds...
timeout /t 3 /nobreak >nul
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:5173"
) else (
    start http://localhost:5173
)

echo ======================================================================
echo   Reunite is now running!
echo   - Web Application: http://localhost:5173
echo   - Backend API    : http://127.0.0.1:8000/api/
echo   - Health Check   : http://127.0.0.1:8000/api/health/
echo ======================================================================
echo.
echo Press any key to exit this launcher window (servers will stay running).
pause >nul
