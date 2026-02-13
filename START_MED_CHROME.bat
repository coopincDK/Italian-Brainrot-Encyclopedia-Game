@echo off
echo ========================================
echo   ITALIAN BRAINROT - CHROME LAUNCHER
echo ========================================
echo.
echo Starter Chrome med lokal fil support...
echo.

REM Find Chrome installation
set CHROME=""
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if %CHROME%=="" (
    echo Chrome blev ikke fundet!
    echo Åbn ÅBEN_DENNE.html manuelt i din browser.
    pause
    exit
)

REM Start Chrome med flag der tillader lokale filer
start "" %CHROME% --allow-file-access-from-files "%~dp0START_HER.html"

echo.
echo ✅ Chrome startet!
echo.
echo Hvis spillet ikke åbner automatisk:
echo 1. Dobbeltklik på ÅBEN_DENNE.html
echo 2. Klik på "START SPILLET"
echo.
timeout /t 3
