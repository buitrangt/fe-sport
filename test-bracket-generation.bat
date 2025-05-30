@echo off
echo ==========================================
echo TESTING BRACKET GENERATION
echo ==========================================
echo.

echo ✅ Added Bracket Generation Debugger
echo ✅ Ready to test complete workflow
echo.
echo Opening debug page...

timeout /t 2
start "" "http://localhost:3000/debug"

echo.
echo ========================================
echo TESTING WORKFLOW:
echo ========================================
echo 1. Go to: http://localhost:3000/debug
echo 2. Scroll down to "Bracket Generation Debugger"
echo 3. Click "Load Teams" to see registered teams
echo 4. Click "Generate Bracket" to create matches
echo 5. Go back to admin page to see matches
echo.
echo ========================================
echo EXPECTED RESULTS:
echo ========================================
echo ✅ Load Teams: Shows list of teams with status
echo ✅ Generate Bracket: Creates matches for tournament
echo ✅ Admin Page: /admin/tournaments/44 shows matches
echo ❌ If fails: Check console for detailed errors
echo ========================================
