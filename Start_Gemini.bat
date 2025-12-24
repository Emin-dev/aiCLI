@echo off
setlocal EnableDelayedExpansion
title Gemini Autonomous Administrator

>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

if exist "GEMINI.md" (
    rem Local memory found
) else (
    if exist "%USERPROFILE%\.gemini\GEMINI.md" (
        copy "%USERPROFILE%\.gemini\GEMINI.md" "GEMINI.md"
    ) else (
        echo # Gemini Memory > GEMINI.md
    )
)

echo [Sync] Synchronizing with cloud...
call node scripts/sync_from_cloud.js

echo [Update] Updating dependencies...
call npm install

call node scripts/review_performance.js
call node scripts/backup_memory.js

echo ========================================================
echo   GEMINI AUTONOMOUS SYSTEM
echo ========================================================

call npm start -- "System Instruction: Startup. 1. Read GEMINI.md. 2. Verify tasks. 3. Execute improvements. 4. Update GEMINI.md."

pause