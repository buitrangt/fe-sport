@echo off
echo ==========================================
echo FIXING TOURNAMENT ADMIN DETAIL PAGE ERROR
echo ==========================================
echo.

echo 1. Starting Frontend Development Server...
cd /d "C:\Users\ACER\Desktop\fe\fe-sport"

echo 2. Installing any missing dependencies...
call npm install --silent

echo 3. Starting development server...
echo.
echo ========================================
echo TESTING INSTRUCTIONS:
echo ========================================
echo 1. After server starts, open browser to:
echo    http://localhost:3000/debug
echo.
echo 2. Click "Run All Tests" to debug APIs
echo.  
echo 3. Check the failing endpoints and fix:
echo    - If 404: Backend endpoint missing or different URL
echo    - If 401: Authentication/token issue  
echo    - If 500: Backend service error
echo.
echo 4. After fixing, test the actual page:
echo    http://localhost:3000/admin/tournaments/44
echo.
echo ========================================

start "" "http://localhost:3000/debug"
call npm start
