#!/bin/bash

# Script de inicio automático para Mahitek 3D Lab MX
# Se ejecuta al abrir el proyecto en VS Code

echo "🚀 Iniciando Mahitek 3D Lab MX..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📥 Descarga desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Iniciar servidor de desarrollo
echo "🌐 Iniciando servidor de desarrollo en puerto 8080..."
echo "📍 URL: http://localhost:8080"
echo ""
echo "💡 Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
