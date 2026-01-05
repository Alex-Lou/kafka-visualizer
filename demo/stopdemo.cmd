@echo off
REM Stop Kafka Demo Producer
echo Stopping Kafka Demo...

REM Check if PID file exists
if not exist demo.pid (
    echo Demo is not running or PID file not found.
    exit /b 1
)

REM Read PID and kill the process
set /p PID=<demo.pid
echo Killing process %PID%...
taskkill /PID %PID% /F > nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Demo stopped successfully
) else (
    echo Failed to stop demo or process already stopped
)

REM Clean up PID file
del demo.pid

echo Done!
