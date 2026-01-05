@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║   Kafka Visualizer - Demo Launcher        ║
echo ╚════════════════════════════════════════════╝
echo.

REM Colors for Windows
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

echo %BLUE%📋 Checking prerequisites...%RESET%

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Docker is not installed or not running%RESET%
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo %GREEN%✅ Docker found%RESET%

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Node.js is not installed%RESET%
    echo Please install Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo %GREEN%✅ Node.js found%RESET%

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Java is not installed%RESET%
    echo Please install Java 21: https://adoptium.net/
    pause
    exit /b 1
)
echo %GREEN%✅ Java found%RESET%

echo.
echo %BLUE%🚀 Starting demo environment...%RESET%
echo.

REM Step 1: Start Kafka with Docker Compose
echo %BLUE%[1/5] Starting Kafka cluster...%RESET%
cd /d "%~dp0.."
docker-compose -f docker-compose.demo.yml up -d
if %errorlevel% neq 0 (
    echo %RED%❌ Failed to start Kafka%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Kafka cluster started%RESET%

REM Wait for Kafka to be ready
echo %YELLOW%⏳ Waiting for Kafka to be ready (30s)...%RESET%
timeout /t 30 /nobreak >nul

REM Step 2: Install demo dependencies
echo.
echo %BLUE%[2/5] Installing demo dependencies...%RESET%
cd demo
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo %RED%❌ Failed to install demo dependencies%RESET%
        pause
        exit /b 1
    )
)
echo %GREEN%✅ Demo dependencies installed%RESET%
cd ..

REM Step 3: Start backend
echo.
echo %BLUE%[3/5] Starting backend...%RESET%
cd backend
start "Kafka Visualizer - Backend" cmd /k "mvn spring-boot:run"
if %errorlevel% neq 0 (
    echo %RED%❌ Failed to start backend%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Backend starting...%RESET%
cd ..

REM Wait for backend to start
echo %YELLOW%⏳ Waiting for backend to start (20s)...%RESET%
timeout /t 20 /nobreak >nul

REM Step 4: Start frontend
echo.
echo %BLUE%[4/5] Starting frontend...%RESET%
cd frontend
start "Kafka Visualizer - Frontend" cmd /k "npm run dev"
if %errorlevel% neq 0 (
    echo %RED%❌ Failed to start frontend%RESET%
    pause
    exit /b 1
)
echo %GREEN%✅ Frontend starting...%RESET%
cd ..

REM Wait for frontend to start
echo %YELLOW%⏳ Waiting for frontend to start (10s)...%RESET%
timeout /t 10 /nobreak >nul

REM Step 5: Run demo scenario
echo.
echo %BLUE%[5/5] Ready to run demo scenario%RESET%
echo.
echo %YELLOW%════════════════════════════════════════════%RESET%
echo %YELLOW%  Demo environment is ready!%RESET%
echo %YELLOW%════════════════════════════════════════════%RESET%
echo.
echo %GREEN%✅ Kafka:    http://localhost:9092%RESET%
echo %GREEN%✅ Backend:  http://localhost:8080%RESET%
echo %GREEN%✅ Frontend: http://localhost:5173%RESET%
echo.
echo %BLUE%Press any key to start the demo scenario...%RESET%
pause >nul

echo.
echo %GREEN%🎬 Starting demo scenario...%RESET%
cd demo
start "Kafka Visualizer - Demo" cmd /k "npm start"
cd ..

echo.
echo %GREEN%════════════════════════════════════════════%RESET%
echo %GREEN%  Demo is running! 🎉%RESET%
echo %GREEN%════════════════════════════════════════════%RESET%
echo.
echo Open your browser: http://localhost:5173
echo.
echo The demo will run for approximately 3.5 minutes
echo Watch the dashboard for real-time updates!
echo.
echo %YELLOW%Press any key to stop all services when done...%RESET%
pause >nul

echo.
echo %BLUE%🛑 Stopping services...%RESET%

REM Stop Kafka
docker-compose -f docker-compose.demo.yml down
echo %GREEN%✅ Kafka stopped%RESET%

echo.
echo %GREEN%✅ Demo complete! Thank you!%RESET%
echo.
pause
