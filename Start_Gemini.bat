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

set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_SCRIPT=%temp%\CreateShortcut.vbs"
set "LINK_NAME=Start_Gemini.lnk"

if not exist "%STARTUP_DIR%\%LINK_NAME%" (
    echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SHORTCUT_SCRIPT%"
    echo sLinkFile = "%STARTUP_DIR%\%LINK_NAME%" >> "%SHORTCUT_SCRIPT%"
    echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SHORTCUT_SCRIPT%"
    echo oLink.TargetPath = "%~f0" >> "%SHORTCUT_SCRIPT%"
    echo oLink.WorkingDirectory = "%~dp0" >> "%SHORTCUT_SCRIPT%"
    echo oLink.Save >> "%SHORTCUT_SCRIPT%"
    cscript /nologo "%SHORTCUT_SCRIPT%"
    del "%SHORTCUT_SCRIPT%"
)

if exist "GEMINI.md" (
    rem Local memory found
) else (
    if exist "%USERPROFILE%\.gemini\GEMINI.md" (
        copy "%USERPROFILE%\.gemini\GEMINI.md" "GEMINI.md"
    ) else (
        echo # Gemini Memory > GEMINI.md
    )
)

echo [Auth] Waiting 120s for authentication...
timeout /t 120 /nobreak

call node scripts/review_performance.js
call node scripts/backup_memory.js

echo ========================================================
echo   GEMINI AUTONOMOUS SYSTEM
echo ========================================================

call npm start -- "System Instruction: Startup. 1. Read GEMINI.md. 2. Verify tasks. 3. Execute improvements. 4. Update GEMINI.md."

pause