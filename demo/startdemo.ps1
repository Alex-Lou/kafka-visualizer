# Start Kafka Demo Producer
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Starting Kafka Demo Producer                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if demo is already running
if (Test-Path "demo.pid") {
    Write-Host "[ERROR] Demo is already running. Use stopdemo to stop it first." -ForegroundColor Red
    exit 1
}

# Change to script directory
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "[INFO] Launching demo in new terminal window..." -ForegroundColor Cyan
Write-Host "[INFO] The demo will run for 5 minutes with real-time output" -ForegroundColor Cyan
Write-Host ""

# Start the demo in a new visible window
$process = Start-Process -FilePath "node" -ArgumentList "demo-producer.js" -PassThru -WindowStyle Normal

# Save PID
$process.Id | Out-File "demo.pid"

Write-Host ""
Write-Host "[SUCCESS] Demo started with PID: $($process.Id)" -ForegroundColor Green
Write-Host "[INFO] A new terminal window has been opened showing the demo output" -ForegroundColor Cyan
Write-Host "[INFO] The demo will run for approximately 5 minutes" -ForegroundColor Cyan
Write-Host "[INFO] You can see messages being sent to Kafka in real-time" -ForegroundColor Cyan
Write-Host ""
Write-Host "Use 'stopdemo.ps1' to stop the demo before it completes" -ForegroundColor Yellow
Write-Host ""
