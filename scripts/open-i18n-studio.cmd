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

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js, then try again.
  pause
  exit /b 1
)

echo Checking %STUDIO_URL% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url='%STUDIO_URL%'; $marker='%STUDIO_MARKER%'; try { $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200 -and $r.Content -like ('*'+$marker+'*')) { exit 0 }; exit 2 } catch { exit 1 }"
set "CHECK=%ERRORLEVEL%"

if "%CHECK%"=="0" (
  echo Studio is ready. Opening browser...
  start "" "%STUDIO_URL%"
  exit /b 0
)

if "%CHECK%"=="2" (
  echo Port 3000 responds but is not this Studio ^(wrong/old app^). Restarting...
) else (
  echo Dev server not ready ^(hung or not running^). Restarting...
)

REM Free port 3000 if something is stuck listening.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; foreach ($c in $conns) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction Stop; Write-Host ('Killed PID ' + $c.OwningProcess) } catch {} }"

timeout /t 2 /nobreak >nul

echo Starting npm run dev in a new window...
start "mahjong-hub-dev" cmd /k "cd /d ""%~dp0.."" && npm run dev"

echo Waiting for Studio ^(up to ~2 min^)...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url='%STUDIO_URL%'; $marker='%STUDIO_MARKER%'; $ok=$false; for ($i=0; $i -lt 60; $i++) { try { $r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200 -and $r.Content -like ('*'+$marker+'*')) { $ok=$true; break } } catch {} ; Start-Sleep -Seconds 2 }; if ($ok) { exit 0 } else { exit 1 }"

if errorlevel 1 (
  echo [ERROR] Timed out waiting for Content Studio.
  echo Check the "mahjong-hub-dev" window for compile errors, then open:
  echo   %STUDIO_URL%
  echo Expected page title text: "%STUDIO_MARKER%"
  pause
  exit /b 1
)

echo Opening Content Studio...
start "" "%STUDIO_URL%"
echo Done. Keep the "mahjong-hub-dev" window open while you edit.
exit /b 0
