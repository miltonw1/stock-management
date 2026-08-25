$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

Start-Process pwsh -WorkingDirectory (Join-Path $root 'stock-management-back') -ArgumentList '-NoExit', '-Command', 'npm run start:dev'
Start-Process pwsh -WorkingDirectory (Join-Path $root 'stock-management-front') -ArgumentList '-NoExit', '-Command', 'npm run dev'

Write-Host "Abriendo Backend (http://localhost:3000) y Frontend (http://localhost:5173)..." -ForegroundColor Green
