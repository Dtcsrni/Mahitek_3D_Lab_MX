#!/usr/bin/env pwsh
# Sistema de Commit Automatizado - Mahitek 3D Lab
# Ejecuta validaciones, genera mensaje de commit profesional y hace push

param(
    [Parameter(Mandatory=$false)]
    [string]$Mensaje = "",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("feat", "fix", "docs", "style", "refactor", "perf", "test", "chore")]
    [string]$Tipo = "feat",
    
    [switch]$NoPush,
    [switch]$SkipTests,
    [switch]$MostrarDetalle,
    [switch]$SinSonidos
)

$ErrorActionPreference = "Stop"

# Cargar librería de sonidos
$sonidosPath = Join-Path $PSScriptRoot "lib\sonidos.ps1"
if (Test-Path $sonidosPath) {
    . $sonidosPath
    if ($SinSonidos) {
        Set-SonidosHabilitados -Habilitado $false
    }
} else {
    # Funciones vacías si no existe la librería
    function Play-ProcesoIniciado { }
    function Play-SolicitarConfirmacion { }
    function Play-Advertencia { }
    function Play-ErrorCritico { }
    function Play-CommitExitoso { }
    function Play-PushExitoso { }
    function Play-TestsFallidos { }
}

# Funciones de output
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Warning-Custom { Write-Host "[WARN] $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Header { Write-Host "`n=== $args ===" -ForegroundColor Magenta }

# Banner
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Sistema de Commit Auto - Mahitek 3D Lab" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Play-ProcesoIniciado  # Sonido suave al iniciar

# ===== 1. Verificar cambios =====
Write-Header "Verificando cambios en Git"

$status = git status --porcelain
if (-not $status) {
    Write-Warning-Custom "No hay cambios para hacer commit"
    exit 0
}

Write-Info "Archivos modificados:"
$status | ForEach-Object { Write-Info "  $_" }

# ===== 2. Ejecutar validaciones (si no se omiten) =====
if (-not $SkipTests) {
    Write-Header "Ejecutando validaciones de código"
    
    $validateScript = Join-Path $PSScriptRoot "validar-codigo.ps1"
    
    if (Test-Path $validateScript) {
        $params = @{}
        if ($MostrarDetalle) { $params.Verbose = $true }
        
        & $validateScript @params
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Las validaciones fallaron. Corrige los errores antes de continuar."
            Write-Info "Usa -SkipTests para omitir validaciones (no recomendado)"
            exit 1
        }
    }
    else {
        Write-Warning-Custom "Script de validación no encontrado en $validateScript"
    }
}
else {
    Write-Warning-Custom "Validaciones omitidas (-SkipTests)"
}

# ===== 3. Generar mensaje de commit profesional =====
Write-Header "Preparando commit"

$archivosModificados = @()
$status | ForEach-Object {
    $parts = $_ -split '\s+'
    if ($parts.Length -ge 2) {
        $archivosModificados += $parts[1]
    }
}

# Si no se proporciona mensaje, generar uno automático
if (-not $Mensaje) {
    Write-Info "Generando mensaje de commit automático..."
    
    # Analizar tipos de archivos modificados
    $tiposArchivos = @{}
    foreach ($archivo in $archivosModificados) {
        $ext = [System.IO.Path]::GetExtension($archivo)
        if ($ext) {
            if (-not $tiposArchivos.ContainsKey($ext)) {
                $tiposArchivos[$ext] = 0
            }
            $tiposArchivos[$ext]++
        }
    }
    
    # Generar descripción basada en archivos
    $descripcion = @()
    
    if ($tiposArchivos[".html"]) {
        $descripcion += "actualizar estructura HTML"
    }
    if ($tiposArchivos[".css"]) {
        $descripcion += "ajustar estilos CSS"
    }
    if ($tiposArchivos[".js"]) {
        $descripcion += "mejorar funcionalidad JavaScript"
    }
    if ($tiposArchivos[".json"]) {
        $descripcion += "actualizar datos JSON"
    }
    if ($tiposArchivos[".md"]) {
        $descripcion += "actualizar documentación"
    }
    if ($tiposArchivos[".svg"]) {
        $descripcion += "optimizar imágenes SVG"
    }
    
    if ($descripcion.Count -eq 0) {
        $descripcion += "actualizar archivos del proyecto"
    }
    
    $Mensaje = $descripcion -join ", "
}

# Formatear mensaje segÃºn Conventional Commits
$commitMsg = "$Tipo`: $Mensaje"

# Agregar detalles adicionales
$detallesCommit = @"

- Archivos modificados: $($archivosModificados.Count)
- Validaciones: $(if ($SkipTests) { 'omitidas' } else { 'ejecutadas â' })
- Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

$commitMsgCompleto = $commitMsg + $detallesCommit

Write-Info "Mensaje de commit:"
Write-Host $commitMsgCompleto -ForegroundColor Yellow

# Confirmar con usuario
Write-Host ""
Play-SolicitarConfirmacion  # Sonido suave para solicitar input
$confirmacion = Read-Host "Continuar con el commit? (S/n)"

if ($confirmacion -and $confirmacion.ToLower() -ne 's' -and $confirmacion.ToLower() -ne 'y') {
    Write-Warning-Custom "Commit cancelado por el usuario"
    exit 0
}

# ===== 5. Stage de archivos =====
Write-Header "Agregando archivos al stage"

try {
    git add -A
    Write-Success "Archivos agregados al stage"
}
catch {
    Write-Error-Custom "Error al agregar archivos: $($_.Exception.Message)"
    exit 1
}

# ===== 6. Hacer commit =====
Write-Header "Creando commit"

try {
    git commit -m $commitMsgCompleto
    Write-Success "Commit creado exitosamente"
    Play-CommitExitoso  # Sonido armonioso de éxito
    
    # Obtener hash del commit
    $commitHash = git rev-parse --short HEAD
    Write-Info "Hash del commit: $commitHash"
}
catch {
    Write-Error-Custom "Error al crear commit: $($_.Exception.Message)"
    Play-ErrorCritico  # Sonido de error crítico
    exit 1
}

# Push (si no se especifica -NoPush)
if (-not $NoPush) {
    Write-Header "Subiendo cambios a GitHub"
    
    Play-SolicitarConfirmacion  # Sonido antes de preguntar
    $confirmPush = Read-Host "Hacer push a origin main? (S/n)"
    
    if ($confirmPush -and $confirmPush.ToLower() -ne 's' -and $confirmPush.ToLower() -ne 'y') {
        Write-Warning-Custom "Push omitido. Usa 'git push origin main' manualmente"
    }
    else {
        try {
            git push origin main
            Write-Success "Cambios subidos a GitHub exitosamente"
            Play-PushExitoso  # Sonido gratificante de éxito completo
        }
        catch {
            Write-Error-Custom "Error al hacer push: $($_.Exception.Message)"
            Write-Warning-Custom "El commit se creó localmente pero no se subió"
            Play-ErrorCritico  # Sonido de error crítico
            exit 1
        }
    }
}
else {
    Write-Warning-Custom "Push omitido (-NoPush)"
    Write-Info "Usa 'git push origin main' para subir los cambios"
}

# Resumen Final
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  PROCESO COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Info "Commit: $commitHash"
Write-Info "Tipo: $Tipo"
Write-Info "Archivos: $($archivosModificados.Count)"
$pushStatus = if ($NoPush) { 'No' } else { 'Si' }
Write-Info "Push: $pushStatus"
Write-Host ""

exit 0







