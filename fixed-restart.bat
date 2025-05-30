@echo off
echo ==========================================
echo FIXING IMPORT PATH ERROR & RESTARTING
echo ==========================================
echo.

cd /d "C:\Users\ACER\Desktop\fe\fe-sport"

echo ✅ Fixed import path: ../services -^> ../../services
echo ✅ Created debug directory
echo.
echo Starting development server...
echo.
echo ========================================
echo TESTING INSTRUCTIONS:
echo ========================================
echo 1. Server will start shortly...
echo 2. Open: http://localhost:3000/debug
echo 3. Click "Run All Tests" 
echo 4. Then test: http://localhost:3000/admin/tournaments/44
echo ========================================
echo.

timeout /t 3
start "" "http://localhost:3000/debug"
call npm start
