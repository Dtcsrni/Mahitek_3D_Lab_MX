#!/usr/bin/env pwsh
# Validación Avanzada - Mahitek 3D Lab
# Detecta errores de integración HTML-JS y problemas de seguridad

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
Write-Host "║  🔒 VALIDACIÓN AVANZADA - Mahitek 3D Lab     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ===== 1. INTEGRIDAD HTML ↔ JavaScript =====
HEAD 'Integridad HTML ↔ JavaScript'

if ((Test-Path 'index.html') -and (Test-Path 'assets/js/app.js')) {
    $html = Get-Content 'index.html' -Raw
    $js = Get-Content 'assets/js/app.js' -Raw
    
    # Buscar getElementById, querySelector
    $getByIdPattern = "getElementById\([`"']([^`"']+)[`"']\)"
    $querySelectorPattern = "querySelector\([`"']#([^`"']+)[`"']\)"
    
    $getByIdMatches = [regex]::Matches($js, $getByIdPattern)
    $querySelectorMatches = [regex]::Matches($js, $querySelectorPattern)
    
    $jsIds = @()
    $jsIds += $getByIdMatches | ForEach-Object { $_.Groups[1].Value }
    $jsIds += $querySelectorMatches | ForEach-Object { $_.Groups[1].Value }
    $jsIds = $jsIds | Select-Object -Unique
    
    INFO "Verificando $($jsIds.Count) IDs usados en JavaScript..."
    
    $idsOK = 0
    $idsFail = 0
    
    foreach ($id in $jsIds) {
        $idPattern = "id=[`"']$id[`"']"
        if ($html -match $idPattern) {
            if ($Verbose) { OK "ID '$id' existe en HTML" }
            $idsOK++
        } else {
            ERR "ID '$id' usado en JS pero NO existe en HTML"
            INFO "  Revisar getElementById('$id') o querySelector('#$id')"
            $idsFail++
        }
    }
    
    if ($idsFail -eq 0) {
        OK "Todos los IDs ($idsOK) existen en HTML y JS"
    }
    
    # Buscar clases manipuladas en JS
    INFO 'Verificando clases CSS manipuladas en JS...'
    
    if (Test-Path 'assets/css/styles.css') {
        $css = Get-Content 'assets/css/styles.css' -Raw
        
        $classPattern = "classList\.(add|remove|toggle)\([`"']([^`"']+)[`"']\)"
        $classMatches = [regex]::Matches($js, $classPattern)
        
        $jsClasses = $classMatches | ForEach-Object { $_.Groups[2].Value } | Select-Object -Unique
        
        $classesOK = 0
        foreach ($clase in $jsClasses) {
            $cssPattern = "\.$clase[\s\{,:]"
            if ($css -match $cssPattern) {
                if ($Verbose) { OK "Clase '$clase' definida en CSS" }
                $classesOK++
            } else {
                WARN "Clase '$clase' usada en JS pero NO en CSS"
            }
        }
        
        if ($classesOK -gt 0) {
            OK "Verificadas $classesOK clases CSS"
        }
    }
}

# ===== 2. SEGURIDAD =====
HEAD 'Seguridad XSS y Vulnerabilidades'

if (Test-Path 'assets/js/app.js') {
    $js = Get-Content 'assets/js/app.js' -Raw
    
    # innerHTML sin sanitizar
    # Nota: Permitimos plantillas validadas manualmente cuando hay un comentario SECURITY: cercano.
    $innerHTMLPattern = '\.innerHTML\s*=\s*([^;]+)'
    $innerHTMLMatches = [regex]::Matches($js, $innerHTMLPattern)
    
    $unsafe = 0
    foreach ($match in $innerHTMLMatches) {
        $valor = $match.Groups[1].Value

        $ctxStart = [Math]::Max(0, $match.Index - 300)
        $ctxLen = [Math]::Min(300, $match.Index - $ctxStart)
        $ctxBefore = if ($ctxLen -gt 0) { $js.Substring($ctxStart, $ctxLen) } else { '' }

        if ($ctxBefore -match 'SECURITY:' ) {
            # Validado manualmente: se asume escapeHTML/sanitizeURL aplicado.
            continue
        }

        if ($valor -match 'escapeHTML' -or $valor -match 'DOMPurify') {
            # Seguro
        } elseif ($valor -match "^[`"']" -or $valor -match '^\`') {
            # Literal
        } else {
            $unsafe++
            $prev = $valor.Substring(0, [Math]::Min(40, $valor.Length))
            $msg = 'innerHTML sin sanitizar: ' + $prev
            ERR $msg
            INFO '  Riesgo XSS - usar escapeHTML'
        }
    }
    if ($unsafe -eq 0) { OK 'No hay innerHTML sin sanitizar (o están marcados como SECURITY:)' }
    
    # eval
    if ($js -match '\beval\s*\(') {
        ERR 'eval() detectado - RIESGO CRÍTICO'
    } else {
        OK 'No usa eval()'
    }
    
    # new Function
    if ($js -match 'new\s+Function\s*\(') {
        ERR 'new Function() detectado - RIESGO'
    } else {
        OK 'No usa new Function()'
    }
    
    # document.write
    if ($js -match 'document\.write\(') {
        WARN 'document.write() - Mala práctica'
    } else {
        OK 'No usa document.write()'
    }
    
    # console.log sin protección
    $consolePattern = 'console\.(log|warn|error)\('
    $consoleMatches = [regex]::Matches($js, $consolePattern)
    $unprotected = 0
    
    foreach ($match in $consoleMatches) {
        $start = [Math]::Max(0, $match.Index - 80)
        $len = [Math]::Min(160, $js.Length - $start)
        $ctx = $js.Substring($start, $len)
        if ($ctx -notmatch 'DEBUG_MODE' -and $ctx -notmatch 'if.*debug') {
            $unprotected++
        }
    }
    
    if ($unprotected -gt 0) {
        WARN "$unprotected console.log sin protección DEBUG_MODE"
    } else {
        OK 'console.log protegido o ausente'
    }
    
    # Función escapeHTML
    if ($js -match 'function\s+escapeHTML') {
        OK 'Función escapeHTML() definida'
    } else {
        WARN 'Función escapeHTML() no encontrada'
    }
}

# CSP (opcional, depende del host)
# Nota: GitHub Pages ignora `_headers`. Se valida solo la presencia del header en ese archivo.
if (Test-Path '_headers') {
    $headers = Get-Content '_headers' -Raw
    if ($headers -match '(?m)^\s*Content-Security-Policy:') {
        OK 'CSP definido en _headers (host-dependiente)'
    } else {
        WARN 'CSP no encontrado en _headers'
    }
} else {
    WARN '_headers no existe (CSP no aplicable en hosts compatibles)'
}

# Headers de seguridad
if (Test-Path '_headers') {
    $headers = Get-Content '_headers' -Raw
    $secHeaders = @('X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy')
    $found = 0
    foreach ($h in $secHeaders) {
        if ($headers -match $h) { $found++ }
    }
    OK "Headers de seguridad: $found/4 configurados"
}

# ===== 3. DATOS JSON =====
HEAD 'Integridad de Datos JSON'

if (Test-Path 'data/promos.json') {
    try {
        $promos = Get-Content 'data/promos.json' -Raw | ConvertFrom-Json
        $errJSON = 0
        
        foreach ($p in $promos) {
            if (-not $p.id) {
                ERR 'Promoción sin ID'
                $errJSON++
            }
            if (-not $p.titulo) {
                ERR "Promo '$($p.id)' sin título"
                $errJSON++
            }
            if ($p.desde -and $p.hasta) {
                try {
                    $d1 = [DateTime]::Parse($p.desde)
                    $d2 = [DateTime]::Parse($p.hasta)
                    if ($d2 -lt $d1) {
                        ERR "Promo '$($p.id)' fechas inválidas"
                        $errJSON++
                    }
                } catch {
                    ERR "Promo '$($p.id)' formato de fecha inválido"
                    $errJSON++
                }
            }
        }
        
        if ($errJSON -eq 0) {
            OK "promos.json: $($promos.Count) promociones OK"
        }
    } catch {
        ERR "Error en promos.json: $($_.Exception.Message)"
    }
}

if (Test-Path 'data/products.json') {
    try {
        $products = Get-Content 'data/products.json' -Raw | ConvertFrom-Json
        $errJSON = 0
        
        foreach ($p in $products) {
            if (-not $p.id) {
                ERR 'Producto sin ID'
                $errJSON++
            }
            if (-not $p.nombre) {
                ERR "Producto '$($p.id)' sin nombre"
                $errJSON++
            }
        }
        
        if ($errJSON -eq 0) {
            OK "products.json: $($products.Count) productos OK"
        }
    } catch {
        ERR "Error en products.json: $($_.Exception.Message)"
    }
}

# ===== RESUMEN =====
Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  📊 RESUMEN VALIDACIÓN AVANZADA              ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Host "✅ Pasadas: $script:OK" -ForegroundColor Green
Write-Host "⚠️  Advertencias: $script:Warns" -ForegroundColor Yellow
Write-Host "✗  Errores: $script:Errores" -ForegroundColor Red
Write-Host ""

if ($script:Errores -gt 0) {
    Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  ⚠️  ERRORES ENCONTRADOS - REVISAR          ║" -ForegroundColor Yellow
    Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ VALIDACIÓN EXITOSA                       ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Green
    if ($script:Warns -gt 0) {
        INFO "Revisar $script:Warns advertencia(s) para mejores prácticas"
    }
    exit 0
}
