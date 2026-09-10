@echo off
REM ============================================================================
REM TuGestiónLegal - Setup de Base de Datos
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     🗄️  TuGestiónLegal - Configurar Base de Datos           ║
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

echo ✅ Verificando que .env.local existe...
if not exist ".env.local" (
    echo.
    echo ❌ ERROR: .env.local no encontrado
    echo.
    echo PASOS OBLIGATORIOS:
    echo   1. Copia .env.example a .env.local
    echo   2. Edita .env.local y rellena:
    echo      - DATABASE_URL (conexión a PostgreSQL)
    echo      - Credenciales de Google
    echo.
    echo   Consulta docs/SETUP_GOOGLE_CLOUD.md
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
echo 🔍 Leyendo DATABASE_URL de .env.local...
for /f "tokens=2 delims==" %%A in ('findstr /R "^DATABASE_URL" .env.local') do set "db_url=%%A"

if "!db_url!"=="" (
    echo.
    echo ❌ ERROR: DATABASE_URL no configurada en .env.local
    echo.
    echo Por favor, edita .env.local y configura:
    echo   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/tugestionlegal"
    echo.
    pause
    exit /b 1
)

echo ✅ DATABASE_URL encontrada
echo.
echo 📋 Ejecutando migraciones de Prisma...
echo.

call npx prisma migrate dev --name init

if errorlevel 1 (
    echo.
    echo ❌ Error durante la migración
    echo.
    echo Posibles causas:
    echo   - PostgreSQL no está corriendo
    echo   - DATABASE_URL es incorrecta
    echo   - La base de datos no existe
    echo.
    echo Soluciones:
    echo   1. Asegúrate que PostgreSQL está corriendo
    echo   2. Verifica DATABASE_URL en .env.local
    echo   3. Crea la base de datos si no existe:
    echo      createdb tugestionlegal
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ ¡Base de datos configurada exitosamente!
echo.
echo Próximos pasos:
echo   1. Ejecuta: start.bat
echo   2. O usa: npm run dev
echo.
pause
