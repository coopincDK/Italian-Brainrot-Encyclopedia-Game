@echo off
echo ========================================
echo   ITALIAN BRAINROT - LOCAL SERVER
echo ========================================
echo.
echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 8000
pause
