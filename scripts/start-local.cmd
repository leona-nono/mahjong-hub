@echo off
setlocal
set "ROOT=%~dp0.."
cd /d "%ROOT%"

set "PATH=C:\Program Files\nodejs;%PATH%"
set "URL=http://localhost:3000/zh"

REM If already listening on 3000, just open the browser.
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 http://127.0.0.1:3000/).StatusCode } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL%==0 goto OPEN

echo Starting Mahjong Hub local server...
start "Mahjong Hub Dev" /min cmd /c "cd /d \"%ROOT%\" && npm run dev"

echo Waiting for http://localhost:3000 ...
powershell -NoProfile -Command ^
  "$ok=$false; for($i=0;$i -lt 60;$i++){ try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 http://127.0.0.1:3000/; if($r.StatusCode -ge 200){ $ok=$true; break } } catch {} ; Start-Sleep -Seconds 1 }; if(-not $ok){ Write-Host 'Server did not become ready in time.'; exit 1 }"
if errorlevel 1 (
  echo Failed to start. Keep the "Mahjong Hub Dev" window open and check errors.
  pause
  exit /b 1
)

:OPEN
start "" "%URL%"
endlocal
