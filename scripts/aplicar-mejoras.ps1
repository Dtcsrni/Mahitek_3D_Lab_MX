#!/usr/bin/env pwsh
# Script de Mejoras Prioritarias - Mahitek 3D Lab
# Implementa las sugerencias de ANALISIS_SISTEMA.md

param(
    [switch]$LimpiarDesktopIni,
    [switch]$FixInlineStyles,
    [switch]$ActualizarGitignore,
    [switch]$TodosLosCambios
)

$ErrorActionPreference = "Stop"

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔧 SCRIPT DE MEJORAS PRIORITARIAS - MAHITEK 3D LAB  " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ===== 1. ACTUALIZAR .gitignore =====
if ($ActualizarGitignore -or $TodosLosCambios) {
    Write-Host "📝 Actualizando .gitignore..." -ForegroundColor Yellow
    
    $gitignorePath = ".gitignore"
    $nuevasLineas = @(
        "",
        "# Windows desktop thumbnails",
        "desktop.ini",
        "**/desktop.ini",
        "Thumbs.db",
        "",
        "# Mac OS",
        ".DS_Store",
        "",
        "# Editor directories",
        ".vscode/*",
        "!.vscode/settings.json",
        "!.vscode/tasks.json",
        "!.vscode/extensions.json",
        "",
        "# NPM extraneous files",
        "@*/desktop.ini"
    )
    
    if (Test-Path $gitignorePath) {
        $contenidoActual = Get-Content $gitignorePath -Raw
        $nuevoContenido = $contenidoActual.TrimEnd() + "`n" + ($nuevasLineas -join "`n")
        Set-Content -Path $gitignorePath -Value $nuevoContenido -NoNewline
        Write-Host "  ✅ .gitignore actualizado" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ .gitignore no encontrado" -ForegroundColor Yellow
    }
}

# ===== 2. LIMPIAR ARCHIVOS desktop.ini =====
if ($LimpiarDesktopIni -or $TodosLosCambios) {
    Write-Host "`n🧹 Limpiando archivos desktop.ini..." -ForegroundColor Yellow
    
    # Buscar todos los desktop.ini
    $desktopFiles = Get-ChildItem -Path . -Filter "desktop.ini" -Recurse -Force -ErrorAction SilentlyContinue
    
    if ($desktopFiles.Count -gt 0) {
        Write-Host "  📋 Encontrados: $($desktopFiles.Count) archivos" -ForegroundColor Cyan
        
        foreach ($file in $desktopFiles) {
            try {
                # Remover del índice de Git (si está trackeado)
                git rm --cached $file.FullName 2>$null
                Write-Host "  🗑️ Removido del Git: $($file.FullName)" -ForegroundColor Gray
            } catch {
                # Si no está en Git, solo informar
            }
        }
        
        Write-Host "  ✅ desktop.ini removidos del control de versiones" -ForegroundColor Green
    } else {
        Write-Host "  ✅ No se encontraron archivos desktop.ini" -ForegroundColor Green
    }
}

# ===== 3. FIX INLINE STYLES =====
if ($FixInlineStyles -or $TodosLosCambios) {
    Write-Host "`n🎨 Moviendo estilos inline a CSS..." -ForegroundColor Yellow
    
    $cssPath = "assets/css/styles.css"
    
    # Estilos a agregar
    $nuevosEstilos = @"

/* ===== CLASES DE BADGES PARA PROMOCIONES ===== */
/* Agregado automáticamente por script de mejoras */

.badge--valor {
  background: #7ec8e3 !important;
}

.badge--premium {
  background: #9b59b6 !important;
}

.badge--envio {
  background: #e74c3c !important;
}

.badge--cultural {
  background: #10b981 !important;
}

.badge--textura {
  background: #6366f1 !important;
}

.badge--equilibrio {
  background: #fb923c !important;
}

.badge--volumen {
  background: #e74c3c !important;
}

.badge--addon {
  background: #10b981 !important;
}

.precio-unidad {
  font-size: 1rem;
  color: #94a3b8;
}

.improvements--green {
  border-left-color: #10b981 !important;
}

/* ===== FIN DE CLASES DE BADGES ===== */

"@
    
    if (Test-Path $cssPath) {
        # Leer contenido actual
        $cssActual = Get-Content $cssPath -Raw
        
        # Verificar si ya existen estas clases
        if ($cssActual -notmatch "badge--valor") {
            # Agregar al final
            $nuevoCSS = $cssActual.TrimEnd() + "`n" + $nuevosEstilos
            Set-Content -Path $cssPath -Value $nuevoCSS -NoNewline
            Write-Host "  ✅ Clases CSS agregadas a $cssPath" -ForegroundColor Green
            
            # Lista de archivos a modificar
            $archivosHTML = @()
            
            Write-Host "`n  📝 Archivos que necesitan actualización manual:" -ForegroundColor Yellow
            foreach ($archivo in $archivosHTML) {
                if (Test-Path $archivo) {
                    Write-Host "     • $archivo" -ForegroundColor Cyan
                    Write-Host "       Reemplazar style='background: #7ec8e3' → class='badge badge--valor'" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  ℹ️ Las clases CSS ya existen en $cssPath" -ForegroundColor Blue
        }
    } else {
        Write-Host "  ⚠️ $cssPath no encontrado" -ForegroundColor Yellow
    }
}

# ===== RESUMEN FINAL =====
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "           ✅ MEJORAS APLICADAS CON ÉXITO           " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "📋 PRÓXIMOS PASOS:`n" -ForegroundColor Cyan

if ($LimpiarDesktopIni -or $TodosLosCambios) {
    Write-Host "  1. Verificar cambios con: git status" -ForegroundColor Yellow
    Write-Host "  2. Hacer commit: .\scripts\commit-auto.ps1 -Tipo chore" -ForegroundColor Yellow
}

if ($FixInlineStyles -or $TodosLosCambios) {
    Write-Host "`n  3. Actualizar archivos HTML manualmente:" -ForegroundColor Yellow
    # Archivos HTML auxiliares removidos (ya no se generan)
    Write-Host "     Buscar: style='background: #...'  " -ForegroundColor Gray
    Write-Host "     Reemplazar por: class='badge badge--...'  " -ForegroundColor Gray
}

Write-Host "`n  4. Revisar ANALISIS_SISTEMA.md para más sugerencias`n" -ForegroundColor Yellow

Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Green

# Mostrar uso si no se pasaron parámetros
if (-not ($LimpiarDesktopIni -or $FixInlineStyles -or $ActualizarGitignore -or $TodosLosCambios)) {
    Write-Host "💡 USO:" -ForegroundColor Magenta
    Write-Host "  .\scripts\aplicar-mejoras.ps1 -TodosLosCambios" -ForegroundColor Cyan
    Write-Host "  .\scripts\aplicar-mejoras.ps1 -LimpiarDesktopIni" -ForegroundColor Cyan
    Write-Host "  .\scripts\aplicar-mejoras.ps1 -FixInlineStyles" -ForegroundColor Cyan
    Write-Host "  .\scripts\aplicar-mejoras.ps1 -ActualizarGitignore`n" -ForegroundColor Cyan
}
