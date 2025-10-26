#!/usr/bin/env pwsh
# Sistema de Validacion de Codigo - Mahitek 3D Lab
# Valida HTML, CSS, JavaScript y archivos de datos antes de commit

param(
    [switch]$Verbose,
    [switch]$FixAutomatic,
    [switch]$SinSonidos
)

$ErrorActionPreference = "Continue"
$script:TotalErrores = 0
$script:TotalAdvertencias = 0
$script:TotalPasados = 0

# Cargar libreria de sonidos
$sonidosPath = Join-Path $PSScriptRoot "lib\sonidos.ps1"
if (Test-Path $sonidosPath) {
    . $sonidosPath
    if ($SinSonidos) {
        Set-SonidosHabilitados -Habilitado $false
    }
} else {
    # Funciones vacias si no existe la libreria
    function Play-ProcesoIniciado { }
    function Play-ValidacionOK { }
    function Play-Advertencia { }
    function Play-ErrorCritico { }
    function Play-TareaCompletada { }
    function Play-TestsFallidos { }
}

# Funciones de output
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Warning-Custom { Write-Host "[WARN] $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Header { Write-Host "`n=== $args ===" -ForegroundColor Magenta }

# ===== 1. Validar Sintaxis JSON =====
function Test-JSONFiles {
    Write-Header "Validando archivos JSON"
    
    $jsonFiles = Get-ChildItem -Path "data", "assets/data" -Filter "*.json" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $jsonFiles) {
        try {
            $null = Get-Content $file.FullName -Raw | ConvertFrom-Json
            Write-Success "JSON válido: $($file.Name)"
            $script:TotalPasados++
        }
        catch {
            Write-Error-Custom "JSON inválido: $($file.Name)"
            Write-Warning-Custom "  Error: $($_.Exception.Message)"
            $script:TotalErrores++
        }
    }
}

# ===== 2. Validar Rutas de Archivos =====
function Test-FileReferences {
    Write-Header "Validando referencias de archivos"
    
    $indexHTML = Get-Content "index.html" -Raw
    
    # Verificar imágenes referenciadas
    $imageRefs = [regex]::Matches($indexHTML, 'src="(assets/img/[^"]+)"')
    foreach ($match in $imageRefs) {
        $imgPath = $match.Groups[1].Value
        if (Test-Path $imgPath) {
            if ($Verbose) { Write-Success "Imagen existe: $imgPath" }
            $script:TotalPasados++
        }
        else {
            Write-Error-Custom "Imagen faltante: $imgPath"
            $script:TotalErrores++
        }
    }
    
    # Verificar archivos CSS
    $cssRefs = [regex]::Matches($indexHTML, 'href="(assets/css/[^"]+)"')
    foreach ($match in $cssRefs) {
        $cssPath = $match.Groups[1].Value -replace '\?v=\d+', ''
        if (Test-Path $cssPath) {
            Write-Success "CSS existe: $cssPath"
            $script:TotalPasados++
        }
        else {
            Write-Error-Custom "CSS faltante: $cssPath"
            $script:TotalErrores++
        }
    }
    
    # Verificar archivos JavaScript
    $jsRefs = [regex]::Matches($indexHTML, 'src="(assets/js/[^"]+)"')
    foreach ($match in $jsRefs) {
        $jsPath = $match.Groups[1].Value -replace '\?v=\d+', ''
        if (Test-Path $jsPath) {
            Write-Success "JavaScript existe: $jsPath"
            $script:TotalPasados++
        }
        else {
            Write-Error-Custom "JavaScript faltante: $jsPath"
            $script:TotalErrores++
        }
    }
}

# ===== 3. Validar Sintaxis JavaScript =====
function Test-JavaScriptSyntax {
    Write-Header "Validando sintaxis JavaScript"
    
    $jsFiles = Get-ChildItem -Path "assets/js" -Filter "*.js" -ErrorAction SilentlyContinue
    
    foreach ($file in $jsFiles) {
        # Usar Node.js para validación real de sintaxis (más confiable que contar paréntesis)
        $nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
        
        if ($nodeAvailable) {
            $nodeCheck = node --check $file.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "JavaScript sintaxis OK: $($file.Name)"
                $script:TotalPasados++
            } else {
                Write-Error-Custom "Error de sintaxis en $($file.Name): $nodeCheck"
                $script:TotalErrores++
            }
        } else {
            # Fallback: validación básica sin Node.js (menos confiable)
            $content = Get-Content $file.FullName -Raw
            
            # Contar paréntesis
            $openParen = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
            $closeParen = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
            
            # Contar llaves
            $openBrace = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
            $closeBrace = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
            
            # Contar corchetes
            $openBracket = ($content.ToCharArray() | Where-Object { $_ -eq '[' }).Count
            $closeBracket = ($content.ToCharArray() | Where-Object { $_ -eq ']' }).Count
            
            if ($openParen -ne $closeParen) {
                Write-Warning-Custom "Paréntesis posiblemente desbalanceados en $($file.Name): $openParen abiertos, $closeParen cerrados (instala Node.js para validación precisa)"
                # No marcar como error, solo advertencia
                $script:TotalAdvertencias++
            }
            elseif ($openBrace -ne $closeBrace) {
                Write-Error-Custom "Llaves desbalanceadas en $($file.Name): $openBrace abiertas, $closeBrace cerradas"
                $script:TotalErrores++
            }
            elseif ($openBracket -ne $closeBracket) {
                Write-Error-Custom "Corchetes desbalanceados en $($file.Name): $openBracket abiertos, $closeBracket cerrados"
                $script:TotalErrores++
            }
            else {
                Write-Success "JavaScript sintaxis básica OK: $($file.Name)"
                $script:TotalPasados++
            }
        }
        
        # Verificar errores comunes
        $content = Get-Content $file.FullName -Raw
        if ($content -match 'console\.log\(' -and $content -notmatch 'CONFIG\.DEBUG_MODE') {
            Write-Warning-Custom "Encontrado console.log sin verificación DEBUG_MODE en $($file.Name)"
            $script:TotalAdvertencias++
        }
    }
}

# ===== 4. Validar Estructura HTML =====
function Test-HTMLStructure {
    Write-Header "Validando estructura HTML"
    
    if (Test-Path "index.html") {
        $html = Get-Content "index.html" -Raw
        
        # Verificar etiquetas críticas
        $requiredTags = @(
            @{ Tag = "<!DOCTYPE html>"; Name = "DOCTYPE" },
            @{ Tag = "<html"; Name = "HTML root" },
            @{ Tag = "<head>"; Name = "HEAD" },
            @{ Tag = "<body"; Name = "BODY" },
            @{ Tag = "<title>"; Name = "TITLE" },
            @{ Tag = 'charset="UTF-8"'; Name = "UTF-8 charset" },
            @{ Tag = 'name="viewport"'; Name = "Viewport meta" }
        )
        
        foreach ($tag in $requiredTags) {
            if ($html -match [regex]::Escape($tag.Tag)) {
                Write-Success "Tag requerido presente: $($tag.Name)"
                $script:TotalPasados++
            }
            else {
                Write-Error-Custom "Tag requerido faltante: $($tag.Name)"
                $script:TotalErrores++
            }
        }
        
        # Verificar meta tags de localización
        if ($html -match 'lang="es-MX"') {
            Write-Success "Idioma configurado correctamente (es-MX)"
            $script:TotalPasados++
        }
        else {
            Write-Warning-Custom "Idioma no es es-MX"
            $script:TotalAdvertencias++
        }
        
        # Verificar Open Graph
        if ($html -match 'property="og:') {
            Write-Success "Meta tags Open Graph presentes"
            $script:TotalPasados++
        }
        else {
            Write-Warning-Custom "Meta tags Open Graph faltantes o incompletos"
            $script:TotalAdvertencias++
        }
    }
    else {
        Write-Error-Custom "Archivo index.html no encontrado"
        $script:TotalErrores++
    }
}

# ===== 5. Validar Datos de Productos/Promos =====
function Test-DataIntegrity {
    Write-Header "Validando integridad de datos"
    
    # Verificar productos
    if (Test-Path "data/products.json") {
        try {
            $products = Get-Content "data/products.json" -Raw | ConvertFrom-Json
            $activeProducts = $products | Where-Object { $_.estado -eq "activo" }
            
            Write-Success "Productos cargados: $($products.Count) total, $($activeProducts.Count) activos"
            $script:TotalPasados++
            
            # Verificar que tengan campos requeridos
            foreach ($product in $activeProducts) {
                if (-not $product.nombre -or (-not $product.precio -and -not $product.precio_mxn)) {
                    Write-Warning-Custom "Producto sin nombre o precio: $($product.id)"
                    $script:TotalAdvertencias++
                }
            }
        }
        catch {
            Write-Error-Custom "Error al procesar products.json: $($_.Exception.Message)"
            $script:TotalErrores++
        }
    }
    
    # Verificar promociones
    if (Test-Path "data/promos.json") {
        try {
            $promos = Get-Content "data/promos.json" -Raw | ConvertFrom-Json
            $activePromos = $promos | Where-Object { $_.estado -eq "activo" }
            
            Write-Success "Promociones cargadas: $($promos.Count) total, $($activePromos.Count) activas"
            $script:TotalPasados++
        }
        catch {
            Write-Error-Custom "Error al procesar promos.json: $($_.Exception.Message)"
            $script:TotalErrores++
        }
    }
}

# ===== 6. Verificar Git Status =====
function Test-GitStatus {
    Write-Header "Verificando estado de Git"
    
    try {
        $status = git status --porcelain
        
        if ($status) {
            $modifiedFiles = ($status | Measure-Object).Count
            Write-Info "Archivos modificados: $modifiedFiles"
            
            if ($Verbose) {
                $status | ForEach-Object { Write-Info "  $_" }
            }
        }
        else {
            Write-Success "Working directory limpio (sin cambios)"
        }
    }
    catch {
        Write-Warning-Custom "No se pudo verificar estado de Git"
    }
}

# Ejecutar todas las validaciones
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Sistema de Validacion - Mahitek 3D Lab" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Play-ProcesoIniciado  # Sonido suave al iniciar

Test-JSONFiles
Test-FileReferences
Test-JavaScriptSyntax
Test-HTMLStructure
Test-DataIntegrity
Test-GitStatus

# Resumen Final
Write-Header "Resumen de Validacion"
Write-Host ""
Write-Success "Pruebas pasadas: $script:TotalPasados"
Write-Warning-Custom "Advertencias: $script:TotalAdvertencias"
Write-Error-Custom "Errores: $script:TotalErrores"
Write-Host ""

if ($script:TotalErrores -eq 0) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  VALIDACION EXITOSA - OK PARA COMMIT" -ForegroundColor Green
    Write-Host "================================================`n" -ForegroundColor Green
    
    # Sonido de exito solo si todo paso (sin advertencias molestas)
    if ($script:TotalAdvertencias -eq 0) {
        Play-ValidacionOK  # Sonido muy sutil
    } else {
        Play-TareaCompletada  # Sonido suave (hay warnings)
    }
    
    exit 0
}
else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  VALIDACION FALLIDA - CORREGIR ERRORES" -ForegroundColor Red
    Write-Host "================================================`n" -ForegroundColor Red
    
    # Sonido de error SOLO si hay errores criticos
    Play-TestsFallidos  # Sonido claro pero no molesto
    
    exit 1
}
