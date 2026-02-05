@echo off
setlocal EnableDelayedExpansion

:: ═══════════════════════════════════════════════════════════════════════════════
:: YUCAST - Setup Script (Windows)
:: ═══════════════════════════════════════════════════════════════════════════════

title Yucast Setup Wizard
cls

echo =======================================================================
echo.
echo    Yucast - Kafka Flow Visualizer - Setup Wizard
echo.
echo =======================================================================
echo.

:: 1. CHECK REQUIREMENTS
echo [1/6] Checking Requirements...

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Java not found. Please install Java 17+.
    pause
    exit /b
) else (
    echo [OK] Java found.
)

where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Maven not found.
) else (
    echo [OK] Maven found.
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found.
    pause
    exit /b
) else (
    echo [OK] Node.js found.
)

:: 2. CHOOSE MODE
echo.
echo [2/6] Choose Installation Mode
echo   1) Demo Mode (Recommended)
echo   2) Development Mode
echo   3) Production Mode
echo.
set /p MODE="Select mode [1/2/3] (default 1): "
if "%MODE%"=="" set MODE=1

if "%MODE%"=="1" (
    set SETUP_MODE=demo
    set SPRING_PROFILE=demo
    set DEMO_MODE=true
    echo Selected: Demo Mode
)
if "%MODE%"=="2" (
    set SETUP_MODE=dev
    set SPRING_PROFILE=local
    set DEMO_MODE=false
    echo Selected: Development Mode
)
if "%MODE%"=="3" (
    set SETUP_MODE=prod
    set SPRING_PROFILE=prod
    set DEMO_MODE=false
    echo Selected: Production Mode
)

:: 3. DATABASE
echo.
echo [3/6] Database Configuration

if "%SETUP_MODE%"=="demo" (
    set DB_URL=jdbc:h2:mem:yucast-demo;DB_CLOSE_DELAY=-1
    set DB_USERNAME=sa
    set DB_PASSWORD=
    echo Using embedded H2 database.
) else (
    set /p DB_URL="Database URL [jdbc:mysql://localhost:3306/yucast...]: "
    if "!DB_URL!"=="" set DB_URL=jdbc:mysql://localhost:3306/yucast?useSSL=false^&serverTimezone=UTC^&allowPublicKeyRetrieval=true
    
    set /p DB_USERNAME="Database Username [yucast]: "
    if "!DB_USERNAME!"=="" set DB_USERNAME=yucast
    
    set /p DB_PASSWORD="Database Password []: "
)

:: 4. KAFKA
echo.
echo [4/6] Kafka Configuration
if "%SETUP_MODE%"=="demo" (
    set KAFKA_BOOTSTRAP=localhost:9092
    set KAFKA_SECURITY=PLAINTEXT
) else (
    set /p KAFKA_BOOTSTRAP="Bootstrap Servers [localhost:9092]: "
    if "!KAFKA_BOOTSTRAP!"=="" set KAFKA_BOOTSTRAP=localhost:9092
    set KAFKA_SECURITY=PLAINTEXT
)

:: 5. GENERATE SECRET (PowerShell Hack)
echo.
echo [5/6] Generating Secrets...
for /f "delims=" %%i in ('powershell -Command "[Guid]::NewGuid().ToString()"') do set JWT_SECRET=%%i
echo Generated JWT Secret.

:: 6. GENERATE FILES
echo.
echo [6/6] Writing Configuration Files...

:: Write .env
(
echo SPRING_PROFILES_ACTIVE=!SPRING_PROFILE!
echo DEMO_MODE=!DEMO_MODE!
echo DB_URL=!DB_URL!
echo DB_USERNAME=!DB_USERNAME!
echo DB_PASSWORD=!DB_PASSWORD!
echo JWT_SECRET=!JWT_SECRET!
echo KAFKA_BOOTSTRAP_SERVERS=!KAFKA_BOOTSTRAP!
echo KAFKA_SECURITY_PROTOCOL=!KAFKA_SECURITY!
echo CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
) > .env

echo Created .env

:: Write backend config
if not exist "backend\src\main\resources" mkdir "backend\src\main\resources"
set CONFIG_FILE=backend\src\main\resources\application-local.yml

(
echo spring:
echo   datasource:
echo     url: ${DB_URL}
echo     username: ${DB_USERNAME}
echo     password: ${DB_PASSWORD}
echo   jpa:
echo     hibernate:
echo       ddl-auto: update
echo     show-sql: false
echo app:
echo   jwt-secret: ${JWT_SECRET}
echo   demo-mode: ${DEMO_MODE:false}
echo cors:
echo   allowed-origins: ${CORS_ALLOWED_ORIGINS}
) > "%CONFIG_FILE%"

echo Created backend config: %CONFIG_FILE%

:: FINISH
echo.
echo =======================================================================
echo    Setup Complete!
echo =======================================================================
echo.
echo 1. Start backend:
echo    cd backend ^& mvn spring-boot:run
echo.
echo 2. Start frontend:
echo    cd frontend ^& npm install ^& npm run dev
echo.
pause