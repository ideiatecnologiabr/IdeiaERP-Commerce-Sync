@echo off
REM IdeiaERP Commerce Sync - Windows Installation Script Wrapper
REM This script runs the PowerShell installation script

echo Installing IdeiaERP Commerce Sync...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0install-service.ps1"
pause



