@echo off
REM Script de inicio automático para Mahitek 3D Lab MX (Windows)
REM Se ejecuta al abrir el proyecto en VS Code

echo.
echo 🚀 Iniciando Mahitek 3D Lab MX...
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📥 Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

node --version
npm --version
echo.

REM Verificar si node_modules existe
if not exist "node_modules\" (
    echo 📦 Instalando dependencias...
    call npm install
    echo.
)

REM Iniciar servidor de desarrollo
echo 🌐 Iniciando servidor de desarrollo en puerto 8080...
echo 📍 URL: http://localhost:8080
echo.
echo 💡 Presiona Ctrl+C para detener el servidor
echo.

call npm run dev
