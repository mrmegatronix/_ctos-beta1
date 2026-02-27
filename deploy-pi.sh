#!/bin/bash
# CTOS Beta - Raspberry Pi Deployment Script
# Run this on your Raspberry Pi netbook running Raspberry Pi OS

set -e

echo "========================================="
echo "  CTOS Beta - Raspberry Pi Setup"
echo "========================================="

# 1. Install Node.js (LTS) if not present
if ! command -v node &> /dev/null; then
    echo "[1/4] Installing Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
else
    echo "[1/4] Node.js already installed: $(node -v)"
fi

# 2. Install dependencies
echo "[2/4] Installing dependencies..."
npm install

# 3. Build production bundle
echo "[3/4] Building production bundle..."
npm run build

# 4. Install and start a lightweight static server
echo "[4/4] Starting server..."
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please reinstall Node.js."
    exit 1
fi

# Get local IP for network access
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "========================================="
echo "  CTOS is ready!"
echo "========================================="
echo "  Local:   http://localhost:3000"
echo "  Network: http://${LOCAL_IP}:3000"
echo "========================================="
echo ""

npx -y serve dist -l 3000 --no-clipboard
