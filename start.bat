@echo off
REM ============================================================================
REM TuGestiónLegal - Script de inicio para desarrollo
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║        🚀 TuGestiónLegal - Iniciando servidor...            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: package.json no encontrado
    echo    Ejecuta este script desde la carpeta del proyecto
    pause
    exit /b 1
)

echo ✅ Verificando dependencias...
if not exist "node_modules" (
    echo.
    echo 📦 Instalando dependencias (esto puede tardar unos minutos)...
    call npm install
    if errorlevel 1 (
        echo ❌ Error durante la instalación
        pause
        exit /b 1
    )
)

echo ✅ Verificando configuración de base de datos...
if not exist ".env.local" (
    echo.
    echo ⚠️  ADVERTENCIA: .env.local no encontrado
    echo.
    echo Por favor, edita .env.local con tus variables de entorno:
    echo   - DATABASE_URL (PostgreSQL)
    echo   - GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
    echo   - GOOGLE_SERVICE_ACCOUNT_EMAIL y PRIVATE_KEY
    echo   - GOOGLE_SHARED_DRIVE_ID
    echo   - DRIVE_FOLDER_* (IDs de carpetas)
    echo.
    echo Consulta .env.example o docs/SETUP_GOOGLE_CLOUD.md para más info
    echo.
    pause
)

echo.
echo ✅ Iniciando servidor de desarrollo...
echo.
echo 📍 La aplicación estará disponible en: http://localhost:3000
echo 🔐 Usa tu cuenta de Google para iniciar sesión
echo.
echo ⏹️  Presiona Ctrl+C para detener el servidor
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

call npm run dev

echo.
echo ═══════════════════════════════════════════════════════════════
echo Servidor detenido.
pause
