@echo off
echo ========================================
echo   ITALIAN BRAINROT - LOCAL SERVER
echo   (Using PHP)
echo ========================================
echo.
echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
php -S localhost:8000
pause
