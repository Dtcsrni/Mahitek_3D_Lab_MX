#!/usr/bin/env pwsh
# Validación de Manifest.json y Recursos Externos
# Detecta problemas con manifest PWA, CDN externos y carga de imágenes

param([switch]$Verbose)

$script:Errores = 0
$script:Warns = 0
$script:OK = 0

function OK { param($m) Write-Host "[✓] $m" -ForegroundColor Green; $script:OK++ }
function ERR { param($m) Write-Host "[✗] $m" -ForegroundColor Red; $script:Errores++ }
function WARN { param($m) Write-Host "[⚠] $m" -ForegroundColor Yellow; $script:Warns++ }
function INFO { param($m) Write-Host "[ℹ] $m" -ForegroundColor Cyan }
function HEAD { param($m) Write-Host "`n━━━ $m ━━━" -ForegroundColor Magenta }

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📦 VALIDACIÓN MANIFEST Y RECURSOS           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ===== 1. VALIDAR MANIFEST.JSON =====
HEAD 'Manifest.json (PWA)'

if (Test-Path 'manifest.json') {
    try {
        $manifest = Get-Content 'manifest.json' -Raw | ConvertFrom-Json
        OK "manifest.json es JSON válido"
        
        # Validar shortcuts
        if ($manifest.shortcuts) {
            INFO "Validando $($manifest.shortcuts.Count) shortcuts..."
            
            foreach ($shortcut in $manifest.shortcuts) {
                # Verificar propiedad 'url' requerida
                if (-not $shortcut.url) {
                    ERR "Shortcut '$($shortcut.name)' no tiene propiedad 'url'"
                } else {
                    if ($Verbose) { OK "Shortcut '$($shortcut.name)' tiene URL: $($shortcut.url)" }
                }
                
                # Verificar iconos tienen 'type'
                if ($shortcut.icons) {
                    foreach ($icon in $shortcut.icons) {
                        if (-not $icon.type) {
                            WARN "Icono en shortcut '$($shortcut.name)' no tiene 'type' definido"
                            INFO "  Agregar 'type': 'image/png' al icono"
                        } else {
                            if ($Verbose) { OK "Icono con type: $($icon.type)" }
                        }
                    }
                }
            }
        }
        
        # Validar iconos principales
        if ($manifest.icons) {
            INFO "Validando $($manifest.icons.Count) iconos principales..."
            
            foreach ($icon in $manifest.icons) {
                # Verificar archivo existe
                if ($icon.src -and (Test-Path $icon.src)) {
                    if ($Verbose) { OK "Icono existe: $($icon.src)" }
                } elseif ($icon.src) {
                    ERR "Icono NO encontrado: $($icon.src)"
                }
                
                # Verificar type
                if (-not $icon.type) {
                    WARN "Icono $($icon.src) no tiene 'type' definido"
                }
            }
        }
        
        # Validar propiedades requeridas
        $requiredProps = @('name', 'short_name', 'start_url', 'display', 'icons')
        foreach ($prop in $requiredProps) {
            if ($manifest.$prop) {
                if ($Verbose) { OK "Propiedad '$prop' presente" }
            } else {
                ERR "Falta propiedad requerida: '$prop'"
            }
        }
        
        OK "Manifest validado"
        
    } catch {
        ERR "Error parseando manifest.json: $($_.Exception.Message)"
    }
} else {
    WARN "manifest.json no encontrado"
}

# ===== 2. DETECTAR DEPENDENCIAS DE CDN EXTERNO =====
HEAD 'Dependencias Externas (CDN)'

$jsFiles = Get-ChildItem -Path 'assets/js' -Filter '*.js' -Recurse -ErrorAction SilentlyContinue

$cdnPatterns = @(
    @{ Pattern = 'cdn\.simpleicons\.org'; Nombre = 'Simple Icons CDN' },
    @{ Pattern = 'cdn\.jsdelivr\.net'; Nombre = 'jsDelivr CDN' },
    @{ Pattern = 'unpkg\.com'; Nombre = 'unpkg CDN' },
    @{ Pattern = 'cdnjs\.cloudflare\.com'; Nombre = 'Cloudflare CDN' },
    @{ Pattern = 'fonts\.googleapis\.com'; Nombre = 'Google Fonts' },
    @{ Pattern = 'ajax\.googleapis\.com'; Nombre = 'Google AJAX' }
)

$cdnDetected = @()

foreach ($jsFile in $jsFiles) {
    $content = Get-Content $jsFile.FullName -Raw
    
    foreach ($cdn in $cdnPatterns) {
        if ($content -match $cdn.Pattern) {
            $cdnDetected += @{
                File = $jsFile.Name
                CDN = $cdn.Nombre
                Pattern = $cdn.Pattern
            }
        }
    }
}

if ($cdnDetected.Count -gt 0) {
    WARN "Detectadas $($cdnDetected.Count) dependencias de CDN externo:"
    
    foreach ($dep in $cdnDetected) {
        INFO "  📡 $($dep.File) → $($dep.CDN)"
    }
    
    INFO "Recomendación: Usar SVG inline o recursos locales para evitar:"
    INFO "  - Errores de carga de red"
    INFO "  - Problemas de CORS"
    INFO "  - Dependencia de servicios externos"
} else {
    OK "No se detectaron dependencias de CDN externo"
}

# ===== 3. VALIDAR MANEJO DE ERRORES EN IMÁGENES =====
HEAD 'Manejo de Errores en Imágenes'

$htmlFiles = Get-ChildItem -Filter '*.html' -ErrorAction SilentlyContinue

foreach ($htmlFile in $htmlFiles) {
    $html = Get-Content $htmlFile.FullName -Raw
    
    # Buscar <img sin onerror
    $imgPattern = '<img[^>]+src=[^>]+>'
    $imgMatches = [regex]::Matches($html, $imgPattern)
    
    $imgSinOnerror = 0
    foreach ($match in $imgMatches) {
        if ($match.Value -notmatch 'onerror=') {
            $imgSinOnerror++
        }
    }
    
    if ($imgSinOnerror -gt 0) {
        WARN "$htmlFile tiene $imgSinOnerror imágenes sin manejo de error (onerror)"
        INFO "  Agregar onerror='this.style.display=\"none\"' o placeholder"
    } else {
        if ($imgMatches.Count -gt 0) {
            OK "Todas las imágenes en $htmlFile tienen manejo de errores"
        }
    }
}

# Revisar en JavaScript también
foreach ($jsFile in $jsFiles) {
    $js = Get-Content $jsFile.FullName -Raw
    
    # Buscar creación dinámica de imágenes sin onerror
    $imgCreatePattern = 'createElement\([''"]img[''"]\)'
    if ($js -match $imgCreatePattern) {
        # Verificar si hay .onerror asignado
        if ($js -notmatch '\.onerror\s*=') {
            WARN "$($jsFile.Name) crea imágenes dinámicas sin manejo de errores"
            INFO "  Agregar img.onerror = () => { ... }"
        }
    }
    
    # Buscar template strings con <img> sin onerror
    $templateImgPattern = '`[^`]*<img[^>]+src=[^>]+>[^`]*`'
    $templateMatches = [regex]::Matches($js, $templateImgPattern)
    
    foreach ($match in $templateMatches) {
        if ($match.Value -notmatch 'onerror=') {
            WARN "$($jsFile.Name) genera <img> en template sin onerror"
            INFO "  Revisar templates con imágenes dinámicas"
        }
    }
}

# ===== 4. VALIDAR LAZY LOADING APROPIADO =====
HEAD 'Lazy Loading de Recursos'

if (Test-Path 'index.html') {
    $html = Get-Content 'index.html' -Raw
    
    # Imágenes críticas (arriba del fold) no deberían ser lazy
    $criticalImgs = [regex]::Matches($html, '<img[^>]*loading=[''"]lazy[''"][^>]*>')
    
    $lazyCount = 0
    foreach ($match in $criticalImgs) {
        # Si está en hero o header, no debería ser lazy
        if ($html.Substring(0, $html.IndexOf($match.Value)) -match '(hero|header)') {
            WARN "Imagen crítica con loading='lazy' puede causar LCP bajo"
            $lazyCount++
        }
    }
    
    if ($lazyCount -eq 0) {
        OK "Lazy loading correctamente aplicado"
    }
}

# ===== RESUMEN =====
Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              📊 RESUMEN                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "  ✓ OK:           " -NoNewline -ForegroundColor Green
Write-Host "$script:OK" -ForegroundColor White

Write-Host "  ⚠ Warnings:     " -NoNewline -ForegroundColor Yellow
Write-Host "$script:Warns" -ForegroundColor White

Write-Host "  ✗ Errores:      " -NoNewline -ForegroundColor Red
Write-Host "$script:Errores`n" -ForegroundColor White

if ($script:Errores -gt 0) {
    Write-Host "❌ Validación FALLIDA - Corregir errores" -ForegroundColor Red
    exit 1
} elseif ($script:Warns -gt 0) {
    Write-Host "⚠️  Validación con WARNINGS - Revisar advertencias" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✅ Validación EXITOSA" -ForegroundColor Green
    exit 0
}
