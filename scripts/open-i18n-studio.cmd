@echo off
setlocal EnableExtensions
REM One-click: start Next.js (if needed) and open Dev Content Studio in the browser.
REM Double-click this file — no need to type npm commands.

cd /d "%~dp0.."
if not exist "package.json" (
  echo [ERROR] Cannot find package.json. Put this script under scripts\ in mahjong-hub.
  pause
  exit /b 1
)

set "STUDIO_URL=http://localhost:3000/dev/i18n"
set "STUDIO_MARKER=Edit translations"
set "API_URL=http://localhost:3000/api/dev/i18n?domain=blog"

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js, then try again.
  pause
  exit /b 1
)

echo Checking Studio page + Save API on :3000 ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$page='%STUDIO_URL%'; $api='%API_URL%'; $marker='%STUDIO_MARKER%'; try { $r = Invoke-WebRequest -Uri $page -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -ne 200 -or $r.Content -notlike ('*'+$marker+'*')) { exit 2 } } catch { exit 1 }; try { $a = Invoke-WebRequest -Uri $api -UseBasicParsing -TimeoutSec 5; if ($a.StatusCode -ne 200 -or $a.Content -notlike '*\"items\"*') { exit 3 }; exit 0 } catch { exit 3 }"
set "CHECK=%ERRORLEVEL%"

if "%CHECK%"=="0" (
  echo Studio + API ready. Opening browser...
  start "" "%STUDIO_URL%"
  exit /b 0
)

if "%CHECK%"=="2" (
  echo Port 3000 responds but is not this Studio ^(wrong/old app^). Restarting...
) else if "%CHECK%"=="3" (
  echo Studio page up but Save API broken ^(stale Next^). Restarting...
) else (
  echo Dev server not ready ^(hung or not running^). Restarting...
)

REM Free port 3000 if something is stuck listening.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; foreach ($c in $conns) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction Stop; Write-Host ('Killed PID ' + $c.OwningProcess) } catch {} }"

timeout /t 2 /nobreak >nul

echo Starting npm run dev in a new window...
start "mahjong-hub-dev" cmd /k "cd /d ""%~dp0.."" && npm run dev"

echo Waiting for Studio + API ^(up to ~2 min^)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$page='%STUDIO_URL%'; $api='%API_URL%'; $marker='%STUDIO_MARKER%'; $ok=$false; for ($i=0; $i -lt 60; $i++) { try { $r=Invoke-WebRequest -Uri $page -UseBasicParsing -TimeoutSec 3; $a=Invoke-WebRequest -Uri $api -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200 -and $r.Content -like ('*'+$marker+'*') -and $a.StatusCode -eq 200 -and $a.Content -like '*\"items\"*') { $ok=$true; break } } catch {} ; Start-Sleep -Seconds 2 }; if ($ok) { exit 0 } else { exit 1 }"

if errorlevel 1 (
  echo [ERROR] Timed out waiting for Content Studio API.
  echo Check the "mahjong-hub-dev" window for compile errors, then open:
  echo   %STUDIO_URL%
  echo Expected page text: "%STUDIO_MARKER%"
  echo Expected API: %API_URL%
  pause
  exit /b 1
)

echo Opening Content Studio...
start "" "%STUDIO_URL%"
echo Done. Keep the "mahjong-hub-dev" window open while you edit.
echo Tip: after Save, the status bar turns green and names the JSON file on disk.
exit /b 0
