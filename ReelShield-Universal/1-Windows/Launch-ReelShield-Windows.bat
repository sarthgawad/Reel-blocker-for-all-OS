@echo off
echo ========================================================
echo       Starting ReelShield for Windows by Sarth
echo ========================================================
echo.
echo Opening ReelShield Interactive Hub & Simulator in your browser...
start index.html
echo.
echo To install as browser extension in Chrome, Edge, or Brave:
echo 1. Open chrome://extensions or edge://extensions
echo 2. Enable Developer Mode (top-right toggle)
echo 3. Click "Load unpacked" and select this folder:
echo    %~dp0
echo.
pause
