@echo off
title Iniciar Gestor de Stock
echo Abriendo Backend (http://localhost:3000) y Frontend (http://localhost:5173)...
cd /d "%~dp0stock-management-back"
start "Stock - Backend (3000)" cmd /k npm run start:dev
cd /d "%~dp0stock-management-front"
start "Stock - Frontend (5173)" cmd /k npm run dev
echo.
echo Listo: cada ventana queda abierta; cierra esta ventana cuando quieras.
