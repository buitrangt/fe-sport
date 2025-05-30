@echo off
echo ==========================================
echo ADDED START TOURNAMENT BUTTON
echo ==========================================
echo.

echo ✅ Added Start Tournament mutation
echo ✅ Added Start Tournament button for READY_TO_START status
echo ✅ Added proper error handling and loading states
echo.
echo Restarting to apply changes...

echo.
echo ========================================
echo TESTING WORKFLOW:
echo ========================================
echo 1. After restart, go to: /admin/tournaments/44
echo 2. Look for "Bắt đầu Giải đấu" button (green)
echo 3. Click it to start tournament
echo 4. Check if matches API works after starting
echo.
echo Expected: Tournament status READY_TO_START → ONGOING
echo Expected: /api/tournaments/44/matches returns matches
echo ========================================

timeout /t 3
start "" "http://localhost:3000/admin/tournaments/44"
