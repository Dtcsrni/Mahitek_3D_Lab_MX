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

# Mantener docs del sistema actualizadas para cambios significativos
echo "🧾 Actualizando ANALISIS_SISTEMA.md..."
npm run docs:update
git add ANALISIS_SISTEMA.md >/dev/null 2>&1 || true

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
# Validate commit message format (Conventional Commits)

COMMIT_MSG_FILE=$1
RAW_MSG=$(cat "$COMMIT_MSG_FILE")
# Subject = first non-empty, non-comment line
SUBJECT=$(printf "%s\n" "$RAW_MSG" | sed '/^#/d' | sed '/^[[:space:]]*$/d' | head -n 1)

# Expected: type(scope): description
# Allowed types: feat, fix, docs, style, refactor, perf, test, chore
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .{1,}"

if [ -z "$SUBJECT" ]; then
    echo ""
    echo "x Commit message empty or comments only"
    echo "  file: $COMMIT_MSG_FILE"
    echo ""
    echo "  Expected format:"
    echo "  type(scope): description"
    echo ""
    echo "  Examples:"
    echo "  feat: add pricing system"
    echo "  fix(css): align mobile navbar"
    echo ""
    echo "  Hint: use scripts/commit-auto.ps1 for guided messages"
    exit 1
fi

if ! printf "%s\n" "$SUBJECT" | grep -qE "$PATTERN"; then
    echo ""
    echo "x Commit message invalid"
    echo ""
    echo "  file: $COMMIT_MSG_FILE"
    echo "  subject: $SUBJECT"
    echo "  subject length: ${#SUBJECT}"
    echo ""
    echo "  Expected format:"
    echo "  type(scope): description"
    echo ""
    echo "  Allowed types: feat, fix, docs, style, refactor, perf, test, chore"
    echo ""
    echo "  Pattern:"
    echo "  $PATTERN"
    echo ""
    if echo "$SUBJECT" | grep -qE "^[^:]+$"; then
        echo "  Hint: missing colon after type(scope)"
        echo ""
    fi
    if echo "$SUBJECT" | grep -qE "^[a-zA-Z]+(\(.+\))?:[^ ]"; then
        echo "  Hint: add a space after colon"
        echo ""
    fi
    if echo "$SUBJECT" | grep -qE "^[a-zA-Z]+"; then
        TYPE=$(printf "%s" "$SUBJECT" | sed -E "s/^([a-zA-Z]+).*/\1/")
        echo "  Detected type: $TYPE"
        echo ""
    fi
    echo "  Examples:"
    echo "  feat: add pricing system"
    echo "  fix(css): align mobile navbar"
    echo ""
    echo "  Hint: use scripts/commit-auto.ps1 for guided messages"
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
