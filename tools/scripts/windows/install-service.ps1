# IdeiaERP Commerce Sync - Windows Installation Script (NSSM)
# This script installs the service using NSSM (Non-Sucking Service Manager)

$ServiceName = "IdeiaERPSync"
$ServiceDisplayName = "IdeiaERP Commerce Sync API"
$ServiceDescription = "Sistema de sincronização entre IdeiaERP e lojas virtuais"
$InstallDir = "C:\Program Files\IdeiaERP\Sync"
$NodePath = (Get-Command node).Source
$ScriptPath = "$InstallDir\dist\apps\api\main.js"

Write-Host "Installing IdeiaERP Commerce Sync..." -ForegroundColor Green

# Check if NSSM is installed
$nssmPath = Get-Command nssm -ErrorAction SilentlyContinue
if (-not $nssmPath) {
    Write-Host "NSSM not found. Please install NSSM first:" -ForegroundColor Red
    Write-Host "1. Download from https://nssm.cc/download" -ForegroundColor Yellow
    Write-Host "2. Extract and add to PATH" -ForegroundColor Yellow
    Write-Host "3. Or run: choco install nssm" -ForegroundColor Yellow
    exit 1
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Please run as Administrator" -ForegroundColor Red
    exit 1
}

# Create installation directory
Write-Host "Creating installation directory: $InstallDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Copy files (assuming we're running from project root)
Write-Host "Copying files..." -ForegroundColor Cyan
Copy-Item -Path "dist" -Destination "$InstallDir\dist" -Recurse -Force
Copy-Item -Path "node_modules" -Destination "$InstallDir\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "ecosystem.config.js" -Destination "$InstallDir\" -Force -ErrorAction SilentlyContinue
Copy-Item -Path "package.json" -Destination "$InstallDir\" -Force -ErrorAction SilentlyContinue

# Remove existing service if it exists
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Removing existing service..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    nssm remove $ServiceName confirm
}

# Install service with NSSM
Write-Host "Installing service with NSSM..." -ForegroundColor Cyan
nssm install $ServiceName $NodePath "$ScriptPath"
nssm set $ServiceName DisplayName $ServiceDisplayName
nssm set $ServiceName Description $ServiceDescription
nssm set $ServiceName AppDirectory $InstallDir
nssm set $ServiceName AppEnvironmentExtra "NODE_ENV=production"
nssm set $ServiceName AppStdout "$InstallDir\logs\service.log"
nssm set $ServiceName AppStderr "$InstallDir\logs\service-error.log"
nssm set $ServiceName AppRotateFiles 1
nssm set $ServiceName AppRotateOnline 1
nssm set $ServiceName AppRotateSeconds 86400
nssm set $ServiceName AppRotateBytes 10485760

# Create logs directory
New-Item -ItemType Directory -Force -Path "$InstallDir\logs" | Out-Null

# Start service
Write-Host "Starting service..." -ForegroundColor Cyan
Start-Service -Name $ServiceName

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Service Name: $ServiceName" -ForegroundColor Cyan
Write-Host "To start: Start-Service -Name $ServiceName" -ForegroundColor Yellow
Write-Host "To stop: Stop-Service -Name $ServiceName" -ForegroundColor Yellow
Write-Host "To check status: Get-Service -Name $ServiceName" -ForegroundColor Yellow



