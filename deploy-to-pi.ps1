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

function Invoke-Rsync {
    if ($env:SSHPASS) { sshpass -e rsync -avzc --exclude="node_modules" -e "ssh -o StrictHostKeyChecking=no" @args } else { rsync -avzc --exclude="node_modules" -e "ssh -o StrictHostKeyChecking=no" @args }
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
    Invoke-Ssh $HostStr "mkdir -p $Dir/backend"

    Write-Host "[2/4] Syncing changed files via Rsync..." -ForegroundColor Yellow
    # Sync dist folder
    Invoke-Rsync "$LOCAL_DIR/dist/" "${HostStr}:${Dir}/dist/"
    # Sync backend folder (excluding node_modules so it doesn't transfer 30k files)
    Invoke-Rsync "$LOCAL_DIR/backend/" "${HostStr}:${Dir}/backend/"
    # Sync root config files
    Invoke-Rsync "$LOCAL_DIR/deploy-pi.sh" "$LOCAL_DIR/ctos.service" "$LOCAL_DIR/package.json" "$LOCAL_DIR/.env.local" "${HostStr}:${Dir}/"

    Write-Host "[3/4] Installing backend dependencies remotely..." -ForegroundColor Yellow
    Invoke-Ssh $HostStr "cd $Dir/backend && npm install --omit=dev"

    Write-Host "[4/4] Restarting CTOS service..." -ForegroundColor Yellow
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

