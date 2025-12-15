<#
  Reparación segura de repo Git en Windows.

  Problema común:
  - Windows puede crear desktop.ini dentro de `.git/` (incl. `.git/reftable/`).
  - Si el repo usa `reftable` (`extensions.refstorage=reftable`), esos archivos pueden provocar refs rotos y fallas al fetch/pull.

  Uso:
    - Vista previa (no destructivo): .\scripts\fix-git-windows.ps1
    - Aplicar cambios:               .\scripts\fix-git-windows.ps1 -Apply

  Nota:
  - Este script no hace `git push` ni toca archivos del sitio.
#>

[CmdletBinding()]
param(
  [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) { Write-Host "• $Message" -ForegroundColor Cyan }
function Write-Warn([string]$Message) { Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Ok([string]$Message) { Write-Host "✓ $Message" -ForegroundColor Green }

function Invoke-Git([string]$Args) {
  & git @Args.Split(' ') 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "git $Args falló (exit $LASTEXITCODE)"
  }
}

Write-Step "Detectando raíz del repo..."
$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $repoRoot) {
  throw "No se detectó un repo Git en este directorio."
}
$repoRoot = $repoRoot.Trim()
Write-Ok "Repo: $repoRoot"

$gitDir = Join-Path $repoRoot '.git'
if (-not (Test-Path $gitDir)) {
  throw "No existe $gitDir (¿submódulo o repo bare?)"
}

Write-Step "Buscando desktop.ini / Thumbs.db dentro de .git..."
$junk = Get-ChildItem -LiteralPath $gitDir -Recurse -Force -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -in @('desktop.ini', 'Thumbs.db') }

if (-not $junk -or $junk.Count -eq 0) {
  Write-Ok "No se encontraron archivos basura dentro de .git"
} else {
  Write-Warn ("Encontrados {0} archivo(s) dentro de .git:" -f $junk.Count)
  $junk | ForEach-Object { Write-Host ("  - {0}" -f $_.FullName) }
}

Write-Step "Detectando formato de refs..."
$configPath = Join-Path $gitDir 'config'
$config = Get-Content -LiteralPath $configPath -Raw
$isReftable = $config -match '(?m)^\s*refstorage\s*=\s*reftable\s*$'

if ($isReftable) {
  Write-Warn "El repo usa reftable (más sensible a archivos extra dentro de .git)."
  Write-Step "Comprobando disponibilidad: git refs migrate ..."
  $help = (& git refs migrate -h 2>$null)
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "Tu git no soporta 'git refs migrate'. Actualiza Git for Windows y reintenta."
  }
} else {
  Write-Ok "El repo usa refs en formato tradicional (files)."
}

if (-not $Apply) {
  Write-Host ""
  Write-Host "MODO VISTA PREVIA (no se aplican cambios)." -ForegroundColor Magenta
  Write-Host "Para aplicar: .\\scripts\\fix-git-windows.ps1 -Apply" -ForegroundColor Magenta
  Write-Host ""

  if ($junk -and $junk.Count -gt 0) {
    Write-Host "Acciones que se aplicarían:" -ForegroundColor Magenta
    Write-Host "  - Quitar atributos oculto/sistema y borrar desktop.ini/Thumbs.db dentro de .git" -ForegroundColor Magenta
  }
  if ($isReftable) {
    Write-Host "  - Migrar refs: git refs migrate --ref-format=files" -ForegroundColor Magenta
  }
  Write-Host "  - Verificar repo: git fsck --full" -ForegroundColor Magenta
  Write-Host "  - Optimizar: git gc" -ForegroundColor Magenta
  exit 0
}

Write-Host ""
Write-Step "Aplicando correcciones..."

if ($junk -and $junk.Count -gt 0) {
  Write-Step "Eliminando archivos basura dentro de .git..."
  foreach ($f in $junk) {
    try {
      attrib -h -s $f.FullName 2>$null | Out-Null
    } catch {
      # no-op
    }
    Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
  }
  Write-Ok "Archivos basura eliminados."
}

if ($isReftable) {
  Write-Step "Migrando refs de reftable → files..."
  Invoke-Git "refs migrate --ref-format=files"
  Write-Ok "Migración completada."
}

Write-Step "Ejecutando verificación (git fsck --full)..."
Invoke-Git "fsck --full" | Out-Host
Write-Ok "fsck OK"

Write-Step "Ejecutando limpieza/compresión (git gc)..."
Invoke-Git "gc" | Out-Host
Write-Ok "gc OK"

Write-Host ""
Write-Ok "Listo. Si seguías viendo errores, intenta: git fetch --prune origin"

