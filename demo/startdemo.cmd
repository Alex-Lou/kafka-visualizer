@echo off
REM Start Kafka Demo Producer
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║    Starting Kafka Demo Producer                  ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM Check if demo is already running
if exist demo.pid (
    echo [ERROR] Demo is already running. Use stopdemo.cmd to stop it first.
    exit /b 1
)

REM Change to demo directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
)

echo [INFO] Launching demo in new terminal window...
echo [INFO] The demo will run for 5 minutes with real-time output
echo.

REM Start the demo in a new visible window and capture PID
for /f "tokens=2 delims=," %%a in ('wmic process call create "cmd /c cd /d \"%cd%\" && node demo-producer.js && pause" ^| find "ProcessId"') do (
    set PID=%%a
)

REM Remove spaces and save PID
set PID=%PID: =%
echo %PID% > demo.pid

echo.
echo [SUCCESS] Demo started with PID: %PID%
echo [INFO] A new terminal window has been opened showing the demo output
echo [INFO] The demo will run for approximately 5 minutes
echo [INFO] You can see messages being sent to Kafka in real-time
echo.
echo Use 'stopdemo.cmd' to stop the demo before it completes
echo.
