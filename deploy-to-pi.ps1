# CTOS Beta - Deploy Script
# Usage: powershell -ExecutionPolicy Bypass -File deploy-to-pi.ps1

$LOCAL_DIR = $PSScriptRoot

# Load Environment Variables
$RPI_PASSWORD = ""
$NETBOOK_PASSWORD = ""

if (Test-Path "$LOCAL_DIR/.env.local") {
    Get-Content "$LOCAL_DIR/.env.local" | ForEach-Object {
        if ($_ -match "^RPI_PASSWORD=(.*)") { $RPI_PASSWORD = $matches[1].Trim() }
        if ($_ -match "^NETBOOK_PASSWORD=(.*)") { $NETBOOK_PASSWORD = $matches[1].Trim() }
    }
}

function Invoke-Ssh {
    if ($env:SSHPASS) { sshpass -e ssh -o StrictHostKeyChecking=no @args } else { ssh -o StrictHostKeyChecking=no @args }
}

function Invoke-Scp {
    if ($env:SSHPASS) { sshpass -e scp -o StrictHostKeyChecking=no @args } else { scp -o StrictHostKeyChecking=no @args }
}

function Deploy-Target {
    param(
        [string]$Name,
        [string]$HostStr,
        [string]$Dir,
        [string]$Password,
        [string]$IP
    )
    
    Write-Host "`n=========================================" -ForegroundColor Cyan
    Write-Host "  Deploying to $Name ($HostStr)" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan

    $env:SSHPASS = $Password

    Write-Host "`n[1/4] Creating remote directory..." -ForegroundColor Yellow
    Invoke-Ssh $HostStr "mkdir -p $Dir"

    Write-Host "[2/4] Copying production build (dist/)..." -ForegroundColor Yellow
    Invoke-Scp -r "$LOCAL_DIR/dist" "${HostStr}:${Dir}/"

    Write-Host "[3/4] Copying deployment files..." -ForegroundColor Yellow
    Invoke-Scp -r "$LOCAL_DIR/backend" "${HostStr}:${Dir}/"
    Invoke-Scp "$LOCAL_DIR/deploy-pi.sh" "${HostStr}:${Dir}/"
    Invoke-Scp "$LOCAL_DIR/ctos.service" "${HostStr}:${Dir}/"
    Invoke-Scp "$LOCAL_DIR/package.json" "${HostStr}:${Dir}/"
    Invoke-Scp "$LOCAL_DIR/.env.local" "${HostStr}:${Dir}/"

    Write-Host "[4/4] Setting up and starting CTOS service..." -ForegroundColor Yellow
    Invoke-Ssh $HostStr "echo `"$env:SSHPASS`" | sudo -S mv ${Dir}/ctos.service /etc/systemd/system/ && echo `"$env:SSHPASS`" | sudo -S systemctl daemon-reload && echo `"$env:SSHPASS`" | sudo -S systemctl enable ctos && echo `"$env:SSHPASS`" | sudo -S systemctl restart ctos"

    Write-Host "`n=========================================" -ForegroundColor Green
    Write-Host "  Deployment to $Name complete!" -ForegroundColor Green
    Write-Host "  Access at: http://${IP}:3000" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
}

# Deploy to Raspberry Pi
Deploy-Target -Name "Raspberry Pi" -HostStr "dietpi@192.168.1.97" -Dir "/home/dietpi/ctos-beta" -Password $RPI_PASSWORD -IP "192.168.1.97"

# Deploy to Netbook
Deploy-Target -Name "Netbook" -HostStr "owner@192.168.1.230" -Dir "/home/owner/ctos-beta" -Password $NETBOOK_PASSWORD -IP "192.168.1.230"
