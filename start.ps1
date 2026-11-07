# Reunite - PowerShell Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                 REUNITE - LOST & FOUND PLATFORM                      " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

# 1. Start MongoDB Windows service if installed
Write-Host "[1/3] Checking MongoDB..." -ForegroundColor Yellow
try {
    Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    Write-Host "      [OK] MongoDB is running." -ForegroundColor Green
} catch {
    Write-Host "      [!] Ensure MongoDB is active on port 27017." -ForegroundColor Gray
}

# 2. Launch Django Backend
Write-Host "[2/3] Launching Django Backend at http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\backend`" && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000" -WindowStyle Normal
Write-Host "      [OK] Backend launched in separate window." -ForegroundColor Green

# 3. Launch React Frontend
Write-Host "[3/3] Launching Frontend at http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev" -WindowStyle Normal
Write-Host "      [OK] Frontend launched in separate window." -ForegroundColor Green

# 4. Open Browser (Google Chrome if installed)
Start-Sleep -Seconds 3
if (Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe") {
    Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "http://localhost:5173"
} else {
    Start-Process "http://localhost:5173"
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Reunite is active!" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend : http://127.0.0.1:8000/api/" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

