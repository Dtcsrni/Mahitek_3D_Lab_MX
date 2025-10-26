#!/usr/bin/env pwsh
# ===== Configurador de Git Hooks =====
# Instala hooks de pre-commit para validación automática
# Autor: Mahitek 3D Lab
# Versión: 1.0.0

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Configurador de Git Hooks             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar que estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: No se encontró directorio .git" -ForegroundColor Red
    Write-Host "   Ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Crear directorio de hooks si no existe
$hooksDir = ".git/hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

# ===== Crear hook de pre-commit =====
$preCommitPath = Join-Path $hooksDir "pre-commit"

$preCommitContent = @'
#!/bin/sh
# Git hook: pre-commit
# Ejecuta validaciones antes de permitir commit

echo "🔍 Ejecutando validaciones pre-commit..."

# Ejecutar script de validación (PowerShell)
pwsh -File scripts/validar-codigo.ps1

# Capturar código de salida
VALIDATION_EXIT_CODE=$?

if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Commit rechazado: Las validaciones fallaron"
    echo "   Corrige los errores o usa 'git commit --no-verify' para omitir (no recomendado)"
    exit 1
fi

echo "✅ Validaciones pasadas - Commit permitido"
exit 0
'@

# Escribir hook
Set-Content -Path $preCommitPath -Value $preCommitContent -Encoding UTF8

# Hacer ejecutable (en Windows esto es principalmente simbólico)
Write-Host "✅ Hook pre-commit instalado en: $preCommitPath" -ForegroundColor Green

# ===== Crear hook de commit-msg (opcional) =====
$commitMsgPath = Join-Path $hooksDir "commit-msg"

$commitMsgContent = @'
#!/bin/sh
# Git hook: commit-msg
# Valida formato de mensajes de commit (Conventional Commits)

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Verificar formato: tipo(scope): mensaje
# Tipos válidos: feat, fix, docs, style, refactor, perf, test, chore
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,}"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
    echo ""
    echo "❌ Formato de mensaje de commit inválido"
    echo ""
    echo "   Formato esperado:"
    echo "   tipo(scope): descripción"
    echo ""
    echo "   Tipos válidos: feat, fix, docs, style, refactor, perf, test, chore"
    echo ""
    echo "   Ejemplo:"
    echo "   feat: agregar sistema de localización"
    echo "   fix(css): corregir alineación en mobile"
    echo ""
    echo "   Usa scripts/commit-auto.ps1 para generar mensajes automáticos"
    exit 1
fi

exit 0
'@

Set-Content -Path $commitMsgPath -Value $commitMsgContent -Encoding UTF8
Write-Host "✅ Hook commit-msg instalado en: $commitMsgPath" -ForegroundColor Green

# ===== Instrucciones =====
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Git Hooks configurados exitosamente                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Hooks instalados:" -ForegroundColor Cyan
Write-Host "   • pre-commit:  Valida código antes de commit" -ForegroundColor White
Write-Host "   • commit-msg:  Valida formato de mensaje" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Uso:" -ForegroundColor Cyan
Write-Host "   Commit normal:        git commit -m 'mensaje'" -ForegroundColor White
Write-Host "   Omitir validaciones:  git commit --no-verify" -ForegroundColor White
Write-Host "   Commit automatizado:  .\scripts\commit-auto.ps1" -ForegroundColor White
Write-Host ""
Write-Host "💡 Los hooks se ejecutarán automáticamente en cada commit" -ForegroundColor Yellow
Write-Host ""

exit 0
