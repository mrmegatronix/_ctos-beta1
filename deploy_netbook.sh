#!/bin/bash
if [ -f .env.local ]; then
  export $(grep '^NETBOOK_PASSWORD=' .env.local | xargs)
fi
if [ -z "$NETBOOK_PASSWORD" ]; then
  echo "Error: NETBOOK_PASSWORD not found in .env.local"
  exit 1
fi
export SSHPASS="$NETBOOK_PASSWORD"
echo "Creating remote directory..."
sshpass -e ssh -F /dev/null -o StrictHostKeyChecking=no owner@192.168.1.230 "mkdir -p /home/owner/ctos-beta"
echo "Copying dist/"
sshpass -e scp -F /dev/null -o StrictHostKeyChecking=no -r dist owner@192.168.1.230:/home/owner/ctos-beta/
echo "Copying other files..."
sshpass -e scp -F /dev/null -o StrictHostKeyChecking=no -r backend deploy-pi.sh ctos.service package.json .env.local owner@192.168.1.230:/home/owner/ctos-beta/
echo "Setting up service..."
sshpass -e ssh -F /dev/null -o StrictHostKeyChecking=no owner@192.168.1.230 "echo '$SSHPASS' | sudo -S mv /home/owner/ctos-beta/ctos.service /etc/systemd/system/ && echo '$SSHPASS' | sudo -S systemctl daemon-reload && echo '$SSHPASS' | sudo -S systemctl enable ctos && echo '$SSHPASS' | sudo -S systemctl restart ctos"
echo "Done"
