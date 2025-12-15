#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════
# Sistema de Validación Integral - Mahitek 3D Lab
# ═══════════════════════════════════════════════════════════════════════════
# Validación completa de código, seguridad, integridad y mejores prácticas
# Versión: 2.0 - Sistema Unificado
# ═══════════════════════════════════════════════════════════════════════════

param(
    [switch]$Verbose,
    [switch]$FixAutomatic,
    [switch]$SinSonidos,
    [switch]$SecurityOnly,
    [switch]$QuickCheck
)

$ErrorActionPreference = "Continue"

# ═══════════════════════════════════════════════════════════════════════════
# CONTADORES GLOBALES
# ═══════════════════════════════════════════════════════════════════════════
$script:TotalPasados = 0
$script:TotalAdvertencias = 0
$script:TotalErrores = 0
$script:TotalCriticos = 0
$script:TotalTests = 0

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE SONIDOS
# ═══════════════════════════════════════════════════════════════════════════
$sonidosPath = Join-Path $PSScriptRoot "lib\sonidos.ps1"
if (Test-Path $sonidosPath) {
    . $sonidosPath
    if ($SinSonidos) {
        Set-SonidosHabilitados -Habilitado $false
    }
} else {
    # Funciones vacías si no existe la librería
    function Play-ProcesoIniciado { }
    function Play-ValidacionOK { }
    function Play-Advertencia { }
    function Play-ErrorCritico { }
    function Play-TareaCompletada { }
    function Play-TestsFallidos { }
}

# ═══════════════════════════════════════════════════════════════════════════
# FUNCIONES DE OUTPUT CON TRACKING
# ═══════════════════════════════════════════════════════════════════════════
function Test-Pass {
    param([string]$Message, [switch]$Silent)
    $script:TotalPasados++
    $script:TotalTests++
    if (-not $Silent -and $Verbose) {
        Write-Host "[✓] $Message" -ForegroundColor Green
    }
}

function Test-Fail {
    param([string]$Message, [string]$Details = "")
    $script:TotalErrores++
    $script:TotalTests++
    Write-Host "[✗] $Message" -ForegroundColor Red
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Test-Critical {
    param([string]$Message, [string]$Details = "")
    $script:TotalCriticos++
    $script:TotalErrores++
    $script:TotalTests++
    Write-Host "[🔴 CRÍTICO] $Message" -ForegroundColor Red -BackgroundColor Yellow
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
    Play-ErrorCritico
}

function Test-Warn {
    param([string]$Message, [string]$Details = "")
    $script:TotalAdvertencias++
    $script:TotalTests++
    Write-Host "[⚠] $Message" -ForegroundColor Yellow
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Write-TestInfo {
    param([string]$Message)
    Write-Host "[ℹ] $Message" -ForegroundColor Cyan
}

function Write-TestHeader {
    param([string]$Message)
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "  $Message" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 1: VALIDACIÓN DE SINTAXIS Y ESTRUCTURA
# ═══════════════════════════════════════════════════════════════════════════
function Test-JSONSyntax {
    Write-TestHeader "1. Validación de Sintaxis JSON"
    
    $jsonPaths = @("data", "assets/data")
    $jsonFiles = @()
    
    foreach ($path in $jsonPaths) {
        if (Test-Path $path) {
            $jsonFiles += Get-ChildItem -Path $path -Filter "*.json" -Recurse -ErrorAction SilentlyContinue
        }
    }
    
    if ($jsonFiles.Count -eq 0) {
        Test-Warn "No se encontraron archivos JSON"
        return
    }
    
    Write-TestInfo "Validando $($jsonFiles.Count) archivos JSON..."
    
    foreach ($file in $jsonFiles) {
        try {
            $null = Get-Content $file.FullName -Raw | ConvertFrom-Json
            Test-Pass "JSON válido: $($file.Name)" -Silent
        }
        catch {
            Test-Fail "JSON inválido: $($file.Name)" -Details $_.Exception.Message
        }
    }
    
    Write-Host "  ✓ Archivos JSON validados: $($jsonFiles.Count)" -ForegroundColor Green
}

function Test-JavaScriptSyntax {
    Write-TestHeader "2. Validación de Sintaxis JavaScript"
    
    if (-not (Test-Path "assets/js")) {
        Test-Warn "Directorio assets/js no encontrado"
        return
    }
    
    $jsFiles = Get-ChildItem -Path "assets/js" -Filter "*.js" -ErrorAction SilentlyContinue
    
    if ($jsFiles.Count -eq 0) {
        Test-Warn "No se encontraron archivos JavaScript"
        return
    }
    
    Write-TestInfo "Validando $($jsFiles.Count) archivos JavaScript..."
    
    foreach ($file in $jsFiles) {
        # Usar Node.js si está disponible
        $nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
        
        if ($nodeAvailable) {
            $nodeCheck = node --check $file.FullName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Test-Pass "JS sintaxis OK: $($file.Name)" -Silent
            } else {
                Test-Fail "Error sintaxis JS: $($file.Name)" -Details $nodeCheck
            }
        } else {
            # Fallback: validación básica
            $content = Get-Content $file.FullName -Raw
            
            $openBrace = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
            $closeBrace = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
            
            if ($openBrace -ne $closeBrace) {
                Test-Fail "Llaves desbalanceadas en $($file.Name)" -Details "$openBrace abiertas, $closeBrace cerradas"
            } else {
                Test-Pass "JS básico OK: $($file.Name)" -Silent
            }
        }
    }
    
    Write-Host "  ✓ Archivos JS validados: $($jsFiles.Count)" -ForegroundColor Green
}

function Test-HTMLStructure {
    Write-TestHeader "3. Validación de Estructura HTML"
    
    if (-not (Test-Path "index.html")) {
        Test-Fail "Archivo index.html no encontrado"
        return
    }
    
    $html = Get-Content "index.html" -Raw
    
    # Tags críticos
    $requiredTags = @(
        @{ Pattern = "<!DOCTYPE html>"; Name = "DOCTYPE" },
        @{ Pattern = "<html"; Name = "HTML root" },
        @{ Pattern = "<head>"; Name = "HEAD" },
        @{ Pattern = "<body"; Name = "BODY" },
        @{ Pattern = "<title>"; Name = "TITLE" },
        @{ Pattern = 'charset="UTF-8"'; Name = "UTF-8 charset" },
        @{ Pattern = 'name="viewport"'; Name = "Viewport meta" }
    )
    
    Write-TestInfo "Verificando tags críticos de HTML..."
    
    foreach ($tag in $requiredTags) {
        if ($html -match [regex]::Escape($tag.Pattern)) {
            Test-Pass "Tag presente: $($tag.Name)" -Silent
        }
        else {
            Test-Fail "Tag faltante: $($tag.Name)"
        }
    }
    
    # Verificar idioma
    if ($html -match 'lang="es-MX"') {
        Test-Pass "Idioma configurado: es-MX" -Silent
    }
    else {
        Test-Warn "Idioma no es es-MX"
    }
    
    # Verificar Open Graph
    if ($html -match 'property="og:') {
        Test-Pass "Meta tags Open Graph presentes" -Silent
    }
    else {
        Test-Warn "Meta tags Open Graph faltantes"
    }
    
    Write-Host "  ✓ Estructura HTML validada" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 1.1: VALIDACIÓN SEMÁNTICA HTML (JSDOM)
# ═══════════════════════════════════════════════════════════════════════════
function Test-HTMLSemantics {
    Write-TestHeader "3b. Validación Semántica HTML (JSDOM)"

    if (-not (Test-Path "scripts/validate-html.js")) {
        Test-Warn "scripts/validate-html.js no encontrado"
        return
    }

    $nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeAvailable) {
        Test-Warn "Node.js no está disponible para validar HTML semántico"
        return
    }

    # Si jsdom no está instalado, usar verificación fallback basada en regex y pila simple
    $jsdomInstalled = Test-Path "node_modules/jsdom"
    if ($jsdomInstalled) {
        $result = node scripts/validate-html.js 2>&1
        if ($LASTEXITCODE -eq 0) {
            Test-Pass "Validación HTML semántica OK" -Silent
        } else {
            Test-Fail "Errores en validación HTML semántica" -Details ($result -join "`n")
        }
        return
    }

    # Fallback ligero sin dependencias (heurístico)
    if (-not (Test-Path 'index.html')) { Test-Warn 'index.html no encontrado'; return }
    $html = Get-Content 'index.html' -Raw

    # Meta y título
    if ($html -match '<meta\s+charset="?UTF-8"?') { Test-Pass 'Charset UTF-8 correcto' -Silent } else { Test-Warn 'Falta <meta charset="UTF-8"> (heurístico)' }
    if ($html -match '<meta\s+name="viewport"[^>]*width\s*=\s*device-width') { Test-Pass 'Viewport correcto' -Silent } else { Test-Warn 'Viewport faltante o incorrecto (heurístico)' }
    if ($html -match '<title>\s*[^<]+</title>') { Test-Pass 'Title presente' -Silent } else { Test-Warn 'Falta <title> con contenido (heurístico)' }

    # apple-touch-icon dentro de head
    $headEnd = $html.IndexOf('</head>')
    if ($headEnd -gt 0) {
        $head = $html.Substring(0, $headEnd)
        if ($head -match 'rel="apple-touch-icon"') { Test-Pass 'apple-touch-icon en <head>' -Silent } else { Test-Warn 'apple-touch-icon no encontrado en <head> (heurístico)' }
    }

    # Pila para UL/OL/LI
    $pattern = '<\/?(ul|ol|li)(\s|>)'
    $matches = [regex]::Matches($html, $pattern, 'IgnoreCase')
    $stack = New-Object System.Collections.Generic.List[string]
    $orphan = 0
    foreach ($m in $matches) {
        $tag = $m.Groups[1].Value.ToLower()
        $closing = $m.Value.StartsWith('</')
        if ($tag -in @('ul','ol')) {
            if (-not $closing) { $stack.Add($tag) } else { if ($stack.Count -gt 0) { [void]$stack.RemoveAt($stack.Count-1) } }
        } elseif ($tag -eq 'li') {
            if ($stack.Count -eq 0 -or ($stack[$stack.Count-1] -notin @('ul','ol'))) { $orphan++ }
        }
    }
    if ($orphan -gt 0) { Test-Warn "Se encontraron $orphan <li> posiblemente fuera de <ul>/<ol> (heurístico)" } else { Test-Pass 'Estructura de listas correcta' -Silent }
}

function Test-FileReferences {
    Write-TestHeader "4. Validación de Referencias de Archivos"
    
    if (-not (Test-Path "index.html")) {
        Test-Fail "index.html no encontrado"
        return
    }
    
    $html = Get-Content "index.html" -Raw
    
    # CSS
    $cssRefs = [regex]::Matches($html, 'href="(assets/css/[^"]+)"')
    foreach ($match in $cssRefs) {
        $cssPath = $match.Groups[1].Value -replace '\?v=\d+', ''
        if (Test-Path $cssPath) {
            Test-Pass "CSS existe: $cssPath" -Silent
        }
        else {
            Test-Fail "CSS faltante: $cssPath"
        }
    }
    
    # JavaScript
    $jsRefs = [regex]::Matches($html, 'src="(assets/js/[^"]+)"')
    foreach ($match in $jsRefs) {
        $jsPath = $match.Groups[1].Value -replace '\?v=\d+', ''
        if (Test-Path $jsPath) {
            Test-Pass "JS existe: $jsPath" -Silent
        }
        else {
            Test-Fail "JS faltante: $jsPath"
        }
    }
    
    Write-Host "  ✓ Referencias de archivos validadas" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 2: VALIDACIÓN DE INTEGRIDAD HTML ↔ JAVASCRIPT
# ═══════════════════════════════════════════════════════════════════════════
function Test-HTMLJavaScriptIntegrity {
    Write-TestHeader "5. Integridad HTML ↔ JavaScript"
    
    if (-not (Test-Path 'index.html') -or -not (Test-Path 'assets/js/app.js')) {
        Test-Warn "Archivos necesarios no encontrados"
        return
    }
    
    $html = Get-Content 'index.html' -Raw
    $js = Get-Content 'assets/js/app.js' -Raw
    
    # ═══ VALIDAR IDs ═══
    Write-TestInfo "Verificando IDs entre HTML y JavaScript..."
    
    $getByIdPattern = "getElementById\([`"']([^`"']+)[`"']\)"
    $querySelectorPattern = "querySelector\([`"']#([^`"']+)[`"']\)"
    
    $getByIdMatches = [regex]::Matches($js, $getByIdPattern)
    $querySelectorMatches = [regex]::Matches($js, $querySelectorPattern)
    
    $jsIds = @()
    $jsIds += $getByIdMatches | ForEach-Object { $_.Groups[1].Value }
    $jsIds += $querySelectorMatches | ForEach-Object { $_.Groups[1].Value }
    $jsIds = $jsIds | Select-Object -Unique
    
    $idsOK = 0
    $idsFail = 0
    
    foreach ($id in $jsIds) {
        $idPattern = "id=[`"']$id[`"']"
        if ($html -match $idPattern) {
            Test-Pass "ID '$id' existe en HTML" -Silent
            $idsOK++
        } else {
            Test-Fail "ID '$id' usado en JS pero NO existe en HTML" -Details "Revisar getElementById('$id') o querySelector('#$id')"
            $idsFail++
        }
    }
    
    if ($idsFail -eq 0 -and $idsOK -gt 0) {
        Write-Host "  ✓ $idsOK IDs verificados - Todos existen" -ForegroundColor Green
    }
    
    # ═══ VALIDAR CLASES CSS ═══
    Write-TestInfo "Verificando clases CSS manipuladas en JS..."
    
    if (Test-Path 'assets/css/styles.css') {
        $css = Get-Content 'assets/css/styles.css' -Raw
        
        $classPattern = "classList\.(add|remove|toggle)\([`"']([^`"']+)[`"']\)"
        $classMatches = [regex]::Matches($js, $classPattern)
        
        $jsClasses = $classMatches | ForEach-Object { $_.Groups[2].Value } | Select-Object -Unique
        
        $classesOK = 0
        foreach ($clase in $jsClasses) {
            $cssPattern = "\.$clase[\s\{,:]"
            if ($css -match $cssPattern) {
                Test-Pass "Clase '$clase' definida en CSS" -Silent
                $classesOK++
            } else {
                Test-Warn "Clase '$clase' usada en JS pero NO en CSS" -Details "Puede ser dinámica o heredada"
            }
        }
        
        if ($classesOK -gt 0) {
            Write-Host "  ✓ $classesOK clases CSS verificadas" -ForegroundColor Green
        }
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 3: VALIDACIÓN DE SEGURIDAD
# ═══════════════════════════════════════════════════════════════════════════
function Test-SecurityVulnerabilities {
    Write-TestHeader "6. Seguridad: XSS, Injection y Vulnerabilidades"
    
    if (-not (Test-Path 'assets/js/app.js')) {
        Test-Warn "assets/js/app.js no encontrado"
        return
    }
    
    $js = Get-Content 'assets/js/app.js' -Raw
    
    # ═══ innerHTML SIN SANITIZACIÓN ═══
    Write-TestInfo "Verificando innerHTML sin sanitización..."
    
    $innerHTMLPattern = '\.innerHTML\s*=\s*([^;]+)'
    $innerHTMLMatches = [regex]::Matches($js, $innerHTMLPattern)
    
    $unsafe = 0
    foreach ($match in $innerHTMLMatches) {
        $valor = $match.Groups[1].Value
        
        # Verificar si hay comentario SECURITY antes del innerHTML
        $start = [Math]::Max(0, $match.Index - 200)
        $len = [Math]::Min(220, $js.Length - $start)
        $ctx = $js.Substring($start, $len)
        
        if ($ctx -match '//\s*SECURITY:.*validado manualmente') {
            # Explícitamente marcado como seguro
            continue
        } elseif ($valor -match 'escapeHTML' -or $valor -match 'DOMPurify') {
            # Seguro por función
            continue
        } elseif ($valor -match "^[`"']" -or $valor -match '^\`') {
            # Literal estático
            continue
        } else {
            $unsafe++
            $prev = $valor.Substring(0, [Math]::Min(50, $valor.Length))
            Test-Critical "innerHTML sin sanitizar detectado" -Details "Código: $prev... | Riesgo: XSS"
        }
    }
    
    if ($unsafe -eq 0) {
        Test-Pass "No hay innerHTML sin sanitizar" -Silent
        Write-Host "  ✓ innerHTML seguro" -ForegroundColor Green
    }
    
    # ═══ eval() ═══
    if ($js -match '\beval\s*\(') {
        Test-Critical "eval() detectado" -Details "Riesgo: Ejecución de código arbitrario"
    } else {
        Test-Pass "No usa eval()" -Silent
    }
    
    # ═══ new Function() ═══
    if ($js -match 'new\s+Function\s*\(') {
        Test-Critical "new Function() detectado" -Details "Riesgo: Similar a eval()"
    } else {
        Test-Pass "No usa new Function()" -Silent
    }
    
    # ═══ document.write() ═══
    if ($js -match 'document\.write\(') {
        Test-Warn "document.write() detectado" -Details "Mala práctica - usar createElement()"
    } else {
        Test-Pass "No usa document.write()" -Silent
    }
    
    # ═══ console.log SIN PROTECCIÓN ═══
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
        Test-Warn "$unprotected console.log sin protección DEBUG_MODE" -Details "Expuestos en producción"
    } else {
        Test-Pass "console.log protegido o ausente" -Silent
    }
    
    # ═══ FUNCIÓN escapeHTML ═══
    if ($js -match 'function\s+escapeHTML') {
        Test-Pass "Función escapeHTML() definida" -Silent
    } else {
        Test-Warn "Función escapeHTML() no encontrada" -Details "Recomendado para sanitización XSS"
    }
    
    # ═══ CSP (opcional, depende del host) ═══
    # Nota: GitHub Pages ignora `_headers`. Esta validación solo confirma su presencia para hosts compatibles.
    if (Test-Path '_headers') {
        $headers = Get-Content '_headers' -Raw
        if ($headers -match '(?m)^\s*Content-Security-Policy:') {
            Test-Pass "CSP definido en _headers (host-dependiente)" -Silent
        } else {
            Test-Warn "CSP no encontrado en _headers" -Details "Recomendado para prevenir XSS (si tu host soporta headers)"
        }
    } else {
        Test-Warn "_headers no existe" -Details "GitHub Pages lo ignora; para CSP usa Netlify/Cloudflare Pages u otro host con headers"
    }
    
    # ═══ HEADERS DE SEGURIDAD ═══
    if (Test-Path '_headers') {
        $headers = Get-Content '_headers' -Raw
        $secHeaders = @('X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy')
        $found = 0
        foreach ($h in $secHeaders) {
            if ($headers -match $h) { $found++ }
        }
        Write-Host "  ✓ Headers de seguridad: $found/4 configurados" -ForegroundColor $(if ($found -ge 3) { 'Green' } else { 'Yellow' })
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 4: VALIDACIÓN DE INTEGRIDAD DE DATOS
# ═══════════════════════════════════════════════════════════════════════════
function Test-DataIntegrity {
    Write-TestHeader "7. Integridad de Datos JSON"
    
    # ═══ PROMOS.JSON ═══
    if (Test-Path 'data/promos.json') {
        try {
            $promos = Get-Content 'data/promos.json' -Raw | ConvertFrom-Json
            $errJSON = 0
            
            Write-TestInfo "Validando $($promos.Count) promociones..."
            
            foreach ($p in $promos) {
                if (-not $p.id) {
                    Test-Fail "Promoción sin ID"
                    $errJSON++
                    continue
                }
                
                if (-not $p.titulo) {
                    Test-Fail "Promo '$($p.id)' sin título"
                    $errJSON++
                }
                
                # Validar fechas
                if ($p.desde -and $p.hasta) {
                    try {
                        $d1 = [DateTime]::Parse($p.desde)
                        $d2 = [DateTime]::Parse($p.hasta)
                        if ($d2 -lt $d1) {
                            Test-Fail "Promo '$($p.id)' fechas inválidas" -Details "hasta ($($p.hasta)) < desde ($($p.desde))"
                            $errJSON++
                        }
                    } catch {
                        Test-Fail "Promo '$($p.id)' formato de fecha inválido" -Details $_.Exception.Message
                        $errJSON++
                    }
                }
                
                # Verificar iconos
                if ($p.icono -and $p.icono -match '^assets/') {
                    if (-not (Test-Path $p.icono)) {
                        Test-Warn "Promo '$($p.id)' icono no encontrado" -Details $p.icono
                    }
                }
            }
            
            if ($errJSON -eq 0) {
                Write-Host "  ✓ promos.json: $($promos.Count) promociones OK" -ForegroundColor Green
            } else {
                Write-Host "  ✗ promos.json: $errJSON errores encontrados" -ForegroundColor Red
            }
        } catch {
            Test-Fail "Error procesando promos.json" -Details $_.Exception.Message
        }
    } else {
        Test-Warn "data/promos.json no encontrado"
    }
    
    # ═══ PRODUCTS.JSON ═══
    if (Test-Path 'data/products.json') {
        try {
            $products = Get-Content 'data/products.json' -Raw | ConvertFrom-Json
            $errJSON = 0
            
            Write-TestInfo "Validando $($products.Count) productos..."
            
            foreach ($p in $products) {
                if (-not $p.id) {
                    Test-Fail "Producto sin ID"
                    $errJSON++
                    continue
                }
                
                if (-not $p.nombre) {
                    Test-Fail "Producto '$($p.id)' sin nombre"
                    $errJSON++
                }
                
                if (-not $p.precio -and -not $p.precio_mxn) {
                    Test-Warn "Producto '$($p.id)' sin precio" -Details "Verificar si es intencional"
                }
            }
            
            if ($errJSON -eq 0) {
                Write-Host "  ✓ products.json: $($products.Count) productos OK" -ForegroundColor Green
            } else {
                Write-Host "  ✗ products.json: $errJSON errores encontrados" -ForegroundColor Red
            }
        } catch {
            Test-Fail "Error procesando products.json" -Details $_.Exception.Message
        }
    } else {
        Test-Warn "data/products.json no encontrado"
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 6: DOCUMENTACIÓN (README y Badges)
# ═══════════════════════════════════════════════════════════════════════════
function Test-DocumentationBadges {
    Write-TestHeader "9. Documentación y Badges"

    $readmePath = "README.md"
    if (-not (Test-Path $readmePath)) {
        Test-Warn "README.md no encontrado"
        return
    }

    $readme = Get-Content $readmePath -Raw

    # Verificar endpoints de badges de Lighthouse
    $expectedBadges = @(
        "docs/badges/lh-performance.json",
        "docs/badges/lh-accessibility.json",
        "docs/badges/lh-best-practices.json",
        "docs/badges/lh-seo.json"
    )

    $missing = 0
    foreach ($badge in $expectedBadges) {
        if (-not (Test-Path $badge)) {
            Test-Warn "Badge faltante: $badge" -Details "Se mostrará 'resource not found' en Shields.io"
            $missing++
        } else {
            Test-Pass "Badge presente: $badge" -Silent
        }
    }

    # Verificar que README refiera a estos endpoints
    $badgeRefsOk = 0
    foreach ($badge in $expectedBadges) {
        $fileName = [IO.Path]::GetFileName($badge)
        if ($readme -match [regex]::Escape($fileName)) { $badgeRefsOk++ }
    }
    if ($badgeRefsOk -ge 3) {
        Write-Host "  ✓ Referencias a badges en README: $badgeRefsOk" -ForegroundColor Green
    } else {
        Test-Warn "README podría no referenciar todos los badges de Lighthouse"
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MÓDULO 5: ESTADO DE GIT
# ═══════════════════════════════════════════════════════════════════════════
function Test-GitStatus {
    Write-TestHeader "8. Estado de Git"
    
    try {
        $status = git status --porcelain 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Test-Warn "No es un repositorio Git o Git no disponible"
            return
        }
        
        if ($status) {
            $modifiedFiles = ($status | Measure-Object).Count
            Write-TestInfo "Archivos modificados: $modifiedFiles"
            
            if ($Verbose) {
                $status | ForEach-Object { Write-TestInfo "  $_" }
            }
        }
        else {
            Write-Host "  ✓ Working directory limpio" -ForegroundColor Green
        }
    }
    catch {
        Test-Warn "Error verificando Git" -Details $_.Exception.Message
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# EJECUCIÓN PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║  🔒 SISTEMA DE VALIDACIÓN INTEGRAL - Mahitek 3D Lab         ║" -ForegroundColor Cyan
Write-Host "║  Versión 2.0 - Sistema Unificado                            ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Play-ProcesoIniciado

$startTime = Get-Date

# Ejecutar módulos según modo
if ($QuickCheck) {
    Write-Host "`n⚡ MODO RÁPIDO - Solo validaciones críticas`n" -ForegroundColor Yellow
    Test-JSONSyntax
    Test-JavaScriptSyntax
    Test-HTMLStructure
    Test-HTMLSemantics
    Test-HTMLJavaScriptIntegrity
    Test-DocumentationBadges
} elseif ($SecurityOnly) {
    Write-Host "`n🛡️  MODO SEGURIDAD - Solo validaciones de seguridad`n" -ForegroundColor Yellow
    Test-SecurityVulnerabilities
} else {
    Write-Host "`n🔍 MODO COMPLETO - Todas las validaciones`n" -ForegroundColor Yellow
    Test-JSONSyntax
    Test-JavaScriptSyntax
    Test-HTMLStructure
    Test-HTMLSemantics
    Test-FileReferences
    Test-HTMLJavaScriptIntegrity
    Test-SecurityVulnerabilities
    
    # Validación de Manifest y Recursos Externos
    Write-TestHeader "9. Manifest.json y Recursos Externos"
    $manifestValidationScript = Join-Path $PSScriptRoot "validar-manifest-y-recursos.ps1"
    if (Test-Path $manifestValidationScript) {
        & $manifestValidationScript
    } else {
        Test-Warn "Script de validación de manifest no encontrado" -Details $manifestValidationScript
    }
    
    Test-DataIntegrity
    Test-DocumentationBadges
    Test-GitStatus
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# ═══════════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  📊 RESUMEN DE VALIDACIÓN                                   ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Host "  Tests ejecutados: $script:TotalTests" -ForegroundColor Cyan
Write-Host "  ✅ Pasados: $script:TotalPasados" -ForegroundColor Green
Write-Host "  ⚠️  Advertencias: $script:TotalAdvertencias" -ForegroundColor Yellow
Write-Host "  ✗  Errores: $script:TotalErrores" -ForegroundColor Red

if ($script:TotalCriticos -gt 0) {
    Write-Host "  🔴 CRÍTICOS: $script:TotalCriticos" -ForegroundColor Red -BackgroundColor Yellow
}

Write-Host "`n  ⏱️  Tiempo de ejecución: $([math]::Round($duration, 2)) segundos`n" -ForegroundColor Gray

# ═══════════════════════════════════════════════════════════════════════════
# DETERMINACIÓN DE ESTADO Y EXIT CODE
# ═══════════════════════════════════════════════════════════════════════════

if ($script:TotalCriticos -gt 0) {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  🔴 ERRORES CRÍTICOS DE SEGURIDAD                           ║" -ForegroundColor Red
    Write-Host "║  ACCIÓN REQUERIDA ANTES DE DEPLOY                           ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Red
    Play-ErrorCritico
    exit 2
} elseif ($script:TotalErrores -gt 0) {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  ⚠️  ERRORES ENCONTRADOS - REVISAR ANTES DE COMMIT         ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    Play-TestsFallidos
    exit 1
} else {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  ✅ VALIDACIÓN EXITOSA - OK PARA COMMIT/DEPLOY             ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    if ($script:TotalAdvertencias -gt 0) {
        Write-TestInfo "Hay $script:TotalAdvertencias advertencia(s) - Revisar para mejores prácticas"
        Play-TareaCompletada
    } else {
        Play-ValidacionOK
    }
    
    exit 0
}
