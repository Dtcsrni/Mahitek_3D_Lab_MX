#!/usr/bin/env pwsh
# ===== Configurador de Git Hooks =====
# Instala hooks de pre-commit para validacion automatica
# Autor: Mahitek 3D Lab
# Version: 1.0.0

$ErrorActionPreference = "Stop"

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "  Configurador de Git Hooks" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

# Verificar que estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] No se encontro directorio .git" -ForegroundColor Red
    Write-Host "  Ejecuta este script desde la raiz del proyecto" -ForegroundColor Yellow
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

echo "[INFO] Ejecutando validaciones pre-commit..."

# Mantener docs del sistema actualizadas para cambios significativos
echo "[INFO] Actualizando ANALISIS_SISTEMA.md..."
npm run docs:update
git add ANALISIS_SISTEMA.md >/dev/null 2>&1 || true

# Ejecutar script de validacion (PowerShell)
pwsh -File scripts/validar-codigo.ps1

# Capturar codigo de salida
VALIDATION_EXIT_CODE=$?

if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "[ERROR] Commit rechazado: Las validaciones fallaron"
    echo "  Corrige los errores o usa 'git commit --no-verify' para omitir (no recomendado)"
    exit 1
fi

echo "[OK] Validaciones pasadas - Commit permitido"
exit 0
'@

# Escribir hook
Set-Content -Path $preCommitPath -Value $preCommitContent -Encoding UTF8

# Hacer ejecutable (en Windows esto es principalmente simbolico)
Write-Host "[OK] Hook pre-commit instalado en: $preCommitPath" -ForegroundColor Green

# ===== Crear hook de commit-msg (opcional) =====
$commitMsgPath = Join-Path $hooksDir "commit-msg"

$commitMsgContent = @'
#!/bin/sh
# Git hook: commit-msg
# Valida formato de mensajes de commit (Conventional Commits)

COMMIT_MSG_FILE=$1
RAW_MSG=$(cat "$COMMIT_MSG_FILE")
# Subject = primera linea no vacia y no comentario
SUBJECT=$(printf "%s\n" "$RAW_MSG" | sed '/^#/d' | sed '/^[[:space:]]*$/d' | head -n 1)

# Formato esperado: tipo(scope): descripcion
# Tipos validos: feat, fix, docs, style, refactor, perf, test, chore
VALID_TYPES="feat|fix|docs|style|refactor|perf|test|chore"
PATTERN="^(${VALID_TYPES})(\(.+\))?: .{1,}"

if [ -z "$SUBJECT" ]; then
    echo ""
    echo "[ERROR] Mensaje de commit vacio o solo comentarios"
    echo "  archivo: $COMMIT_MSG_FILE"
    echo ""
    echo "  Formato esperado:"
    echo "  tipo(scope): descripcion"
    echo ""
    echo "  Ejemplos:"
    echo "  feat: agregar sistema de precios"
    echo "  fix(css): alinear navbar en mobile"
    echo ""
    echo "  Sugerencia: usa scripts/commit-auto.ps1 para mensajes guiados"
    exit 1
fi

if ! printf "%s\n" "$SUBJECT" | grep -qE "$PATTERN"; then
    echo ""
    echo "[ERROR] Mensaje de commit invalido"
    echo ""
    echo "  archivo: $COMMIT_MSG_FILE"
    echo "  asunto: $SUBJECT"
    echo "  longitud del asunto: ${#SUBJECT}"
    echo ""
    echo "  Formato esperado:"
    echo "  tipo(scope): descripcion"
    echo ""
    echo "  Tipos validos: feat, fix, docs, style, refactor, perf, test, chore"
    echo ""
    echo "  Patron:"
    echo "  $PATTERN"
    echo ""
    if echo "$SUBJECT" | grep -qE "^[^:]+$"; then
        echo "  Sugerencia: falta dos puntos despues de tipo(scope)"
        echo ""
    fi
    if echo "$SUBJECT" | grep -qE "^[a-zA-Z]+(\(.+\))?:[^ ]"; then
        echo "  Sugerencia: agrega un espacio despues de dos puntos"
        echo ""
    fi
    TYPE=$(printf "%s" "$SUBJECT" | sed -E "s/^([a-zA-Z]+).*/\1/")
    if [ -n "$TYPE" ]; then
        echo "  Tipo detectado: $TYPE"
        if ! echo "$TYPE" | grep -qE "^(${VALID_TYPES})$"; then
            echo "  Sugerencia: el tipo no es valido"
        fi
        echo ""
    fi
    if [ ${#SUBJECT} -gt 72 ]; then
        echo "  Aviso: el asunto supera 72 caracteres"
        echo ""
    fi
    if echo "$SUBJECT" | grep -qE "^[A-Z]"; then
        echo "  Aviso: evita iniciar la descripcion con mayuscula"
        echo ""
    fi
    if echo "$SUBJECT" | grep -qE "\.$"; then
        echo "  Aviso: evita terminar el asunto con punto"
        echo ""
    fi
    echo "  Ejemplos:"
    echo "  feat: agregar sistema de precios"
    echo "  fix(css): alinear navbar en mobile"
    echo ""
    echo "  Sugerencia: usa scripts/commit-auto.ps1 para mensajes guiados"
    exit 1
fi

exit 0
'@

Set-Content -Path $commitMsgPath -Value $commitMsgContent -Encoding UTF8
Write-Host "[OK] Hook commit-msg instalado en: $commitMsgPath" -ForegroundColor Green

# ===== Instrucciones =====
Write-Host ""
Write-Host "==============================" -ForegroundColor Green
Write-Host "  Git Hooks configurados correctamente" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "- Hooks instalados:" -ForegroundColor Cyan
Write-Host "  - pre-commit: valida codigo antes de commit" -ForegroundColor White
Write-Host "  - commit-msg: valida formato del mensaje" -ForegroundColor White
Write-Host ""
Write-Host "- Uso:" -ForegroundColor Cyan
Write-Host "  - Commit normal:       git commit -m 'mensaje'" -ForegroundColor White
Write-Host "  - Omitir validaciones: git commit --no-verify" -ForegroundColor White
Write-Host "  - Commit guiado:       .\\scripts\\commit-auto.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Nota: Los hooks se ejecutan automaticamente en cada commit" -ForegroundColor Yellow

exit 0
