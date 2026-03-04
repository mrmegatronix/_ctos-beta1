# CTOS Beta - Deploy to Raspberry Pi
# Usage: powershell -ExecutionPolicy Bypass -File deploy-to-pi.ps1

$PI_HOST = "owner@192.168.1.150"
$PI_DIR = "/home/owner/ctos-beta"
$LOCAL_DIR = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CTOS Beta - Deploy to Raspberry Pi"     -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Step 1: Create remote directory
Write-Host "`n[1/4] Creating remote directory..." -ForegroundColor Yellow
ssh $PI_HOST "mkdir -p $PI_DIR"

# Step 2: Copy the built dist folder
Write-Host "[2/4] Copying production build (dist/)..." -ForegroundColor Yellow
scp -r "$LOCAL_DIR\dist" "${PI_HOST}:${PI_DIR}/"

# Step 3: Copy deployment files
Write-Host "[3/4] Copying deployment files..." -ForegroundColor Yellow
scp "$LOCAL_DIR\deploy-pi.sh" "${PI_HOST}:${PI_DIR}/"
scp "$LOCAL_DIR\ctos.service" "${PI_HOST}:${PI_DIR}/"
scp "$LOCAL_DIR\package.json" "${PI_HOST}:${PI_DIR}/"
scp "$LOCAL_DIR\.env.local" "${PI_HOST}:${PI_DIR}/"

# Step 4: Setup and start the service
Write-Host "[4/4] Setting up and starting CTOS service..." -ForegroundColor Yellow
ssh $PI_HOST "sudo mv ${PI_DIR}/ctos.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable ctos && sudo systemctl restart ctos"

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  Deployment and Service Setup complete!" -ForegroundColor Green
Write-Host "  Access at: http://192.168.1.150:3000" -ForegroundColor Green
Write-Host "  Service Status: sudo systemctl status ctos" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
