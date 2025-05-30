@echo off
echo ==========================================
echo QUICK DEBUG TEST
echo ==========================================
echo.

echo ✅ Fixed route issues
echo ✅ Added simple debug page
echo.
echo Opening test URLs...

timeout /t 2
start "" "http://localhost:3000/debug"

echo.
echo ========================================
echo DEBUG ROUTES:
echo ========================================
echo 1. Simple Debug: http://localhost:3000/debug
echo 2. Full Debug:   http://localhost:3000/debug-full  
echo 3. Problem Page: http://localhost:3000/admin/tournaments/44
echo.
echo Check console for detailed logs!
echo ========================================
