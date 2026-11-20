@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 24 LTS before running this project.
 pause
 exit /b 1
)
if not exist node_modules call npm ci
if errorlevel 1 goto failed
call npm run prepare:studio
if errorlevel 1 goto failed
call npm run build:cf
if errorlevel 1 goto failed
if not exist .local-db-ready (
 call node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_watery_puck.sql
 if errorlevel 1 goto failed
 echo ready>.local-db-ready
)
call npm run dev:cf
if errorlevel 1 goto failed
exit /b 0
:failed
pause
exit /b 1
