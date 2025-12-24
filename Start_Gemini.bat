@echo off
setlocal EnableDelayedExpansion
title Gemini Autonomous Administrator

:: --- 1. Admin Check & Elevation ---
echo [Boot] Checking privileges...
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo [Boot] Requesting administrative privileges...
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
    echo [Boot] Admin privileges secured.

:: --- 2. Startup Persistence ---
set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_SCRIPT=%temp%\CreateShortcut.vbs"
set "LINK_NAME=Start_Gemini.lnk"

if not exist "%STARTUP_DIR%\%LINK_NAME%" (
    echo [Persistence] Installing to startup...
    echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SHORTCUT_SCRIPT%"
    echo sLinkFile = "%STARTUP_DIR%\%LINK_NAME%" >> "%SHORTCUT_SCRIPT%"
    echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SHORTCUT_SCRIPT%"
    echo oLink.TargetPath = "%~f0" >> "%SHORTCUT_SCRIPT%"
    echo oLink.WorkingDirectory = "%~dp0" >> "%SHORTCUT_SCRIPT%"
    echo oLink.Save >> "%SHORTCUT_SCRIPT%"
    cscript /nologo "%SHORTCUT_SCRIPT%"
    del "%SHORTCUT_SCRIPT%"
    echo [Persistence] Installation complete.
) else (
    echo [Persistence] System active.
)

:: --- 3. Memory Search & Backup ---
echo [Memory] Searching for GEMINI.md context...
if exist "GEMINI.md" (
    echo [Memory] Local memory found.
) else (
    if exist "%USERPROFILE%\.gemini\GEMINI.md" (
        echo [Memory] Global memory found. Importing...
        copy "%USERPROFILE%\.gemini\GEMINI.md" "GEMINI.md"
    ) else (
        echo [Memory] No memory found. Initializing new memory protocol...
        echo # Gemini Memory > GEMINI.md
    )
)

echo [Auth] Preparing for GitHub synchronization...
echo [Auth] If a browser window appears, please log in now.
echo [Auth] Waiting 2 minutes for authentication grace period...
timeout /t 120 /nobreak

echo [Memory] Executing backup and synchronization...
call node scripts/backup_memory.js

:: --- 4. Launch Autonomous Agent ---
echo.
echo ========================================================
echo   GEMINI AUTONOMOUS SYSTEM
echo   Date: %DATE% %TIME%
echo   Mode: Administrator
echo ========================================================
echo.

echo [Task] Starting daily review and self-improvement cycle...
call npm start -- "System Instruction: You are starting up. 1. Read 'GEMINI.md' to recall who you are and your plans. 2. Verify previous tasks. 3. Propose and execute today's improvements. 4. Update 'GEMINI.md' with new status."

echo [System] Session ended. Waiting for next cycle or manual input.
pause
