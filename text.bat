@echo off
title DIAGNOSTICO PRO TOTAL
setlocal enabledelayedexpansion

echo ==========================================
echo DIAGNOSTICO COMPLETO PRO
echo ==========================================
echo.

:: NODE
echo [1/8] Node.js...
node -v
echo.

:: NPM
echo [2/8] npm...
npm -v
echo.

:: ANGULAR CLI
echo [3/8] Angular CLI...
ng version
echo.

:: node_modules
echo [4/8] node_modules...
if exist node_modules (
    echo OK node_modules
) else (
    echo MISSING node_modules
)
echo.

:: Angular build
echo [5/8] Angular build...
if exist dist\browser (
    echo OK Angular build
) else (
    echo MISSING Angular build
)
echo.

:: Backend
echo [6/8] backend build...
if exist dist\server.js (
    echo OK server.js
) else (
    echo MISSING server.js
)
echo.

:: Firebase
echo [7/8] Firebase...
if exist firebase.json (
    echo OK firebase.json
) else (
    echo MISSING firebase.json
)
echo.

:: Server source
echo [8/8] server.ts...
if exist src\server.ts (
    echo OK server.ts
) else (
    echo MISSING server.ts
)
echo.

echo ==========================================
echo DIAGNOSTICO TERMINADO
echo ==========================================
pause