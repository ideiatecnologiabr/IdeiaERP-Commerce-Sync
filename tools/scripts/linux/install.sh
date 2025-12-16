#!/bin/bash

# IdeiaERP Commerce Sync - Linux Installation Script
# This script installs the service as a systemd unit

set -e

SERVICE_NAME="ideiaerp-sync"
SERVICE_FILE="ideiaerp-sync.service"
INSTALL_DIR="/opt/ideiaerp-sync"
SERVICE_USER="ideiaerp"

echo "Installing IdeiaERP Commerce Sync..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo)"
  exit 1
fi

# Create service user if it doesn't exist
if ! id "$SERVICE_USER" &>/dev/null; then
  echo "Creating service user: $SERVICE_USER"
  useradd -r -s /bin/false $SERVICE_USER
fi

# Create installation directory
echo "Creating installation directory: $INSTALL_DIR"
mkdir -p $INSTALL_DIR

# Copy files (assuming we're running from project root)
echo "Copying files..."
cp -r dist $INSTALL_DIR/
cp -r node_modules $INSTALL_DIR/ 2>/dev/null || echo "node_modules not found, run npm install in $INSTALL_DIR"
cp ecosystem.config.js $INSTALL_DIR/ 2>/dev/null || echo "ecosystem.config.js not found"
cp package.json $INSTALL_DIR/ 2>/dev/null || echo "package.json not found"

# Set ownership
chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR

# Install systemd service
echo "Installing systemd service..."
cp tools/scripts/linux/$SERVICE_FILE /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable service
systemctl enable $SERVICE_NAME

echo "Installation complete!"
echo "To start the service: sudo systemctl start $SERVICE_NAME"
echo "To check status: sudo systemctl status $SERVICE_NAME"
echo "To view logs: sudo journalctl -u $SERVICE_NAME -f"



