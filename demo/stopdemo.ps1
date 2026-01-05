# Stop Kafka Demo Producer
Write-Host "Stopping Kafka Demo..." -ForegroundColor Cyan

# Check if PID file exists
if (-not (Test-Path "demo.pid")) {
    Write-Host "Demo is not running or PID file not found." -ForegroundColor Yellow
    exit 1
}

# Read PID and kill the process
$pid = Get-Content "demo.pid"
Write-Host "Killing process $pid..." -ForegroundColor Gray

try {
    Stop-Process -Id $pid -Force -ErrorAction Stop
    Write-Host "Demo stopped successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to stop demo or process already stopped" -ForegroundColor Red
}

# Clean up PID file
Remove-Item "demo.pid" -ErrorAction SilentlyContinue

Write-Host "Done!" -ForegroundColor Cyan
