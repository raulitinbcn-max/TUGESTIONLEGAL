@echo off
REM ============================================================================
REM TuGestiónLegal - Abrir Prisma Studio
REM ============================================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║    📊 TuGestiónLegal - Prisma Studio (Gestor de BD)         ║
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

echo ✅ Verificando .env.local...
if not exist ".env.local" (
    echo.
    echo ❌ ERROR: .env.local no encontrado
    echo.
    echo Por favor, configura primero:
    echo   1. Copia .env.example a .env.local
    echo   2. Rellena DATABASE_URL con tu conexión PostgreSQL
    echo.
    pause
    exit /b 1
)

echo ✅ Verificando dependencias...
if not exist "node_modules" (
    echo.
    echo 📦 Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ❌ Error durante la instalación
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Abriendo Prisma Studio...
echo.
echo 📍 Se abrirá automáticamente en: http://localhost:5555
echo ⏹️  Presiona Ctrl+C para cerrar
echo.

call npx prisma studio

echo.
echo Prisma Studio cerrado.
pause
