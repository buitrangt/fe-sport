@echo off
echo ==========================================
echo CLEARING ESLINT CACHE AND RESTARTING
echo ==========================================
echo.

cd /d "C:\Users\ACER\Desktop\fe\fe-sport"

echo 🧹 Clearing cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .eslintcache del .eslintcache

echo 🗑️ Removing broken file completely...
if exist "src\pages\MatchManagementPage.js.broken" del "src\pages\MatchManagementPage.js.broken"

echo ✅ Cache cleared and broken file removed
echo 🚀 Starting development server...

timeout /t 2
start "" "http://localhost:3000/admin/tournaments/44"
call npm start
