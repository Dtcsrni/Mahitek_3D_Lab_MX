#!/usr/bin/env pwsh
# Probar Sistema de Sonidos - Mahitek 3D Lab
# Reproduce todos los sonidos disponibles para verificar configuración

# Cargar librería de sonidos
$sonidosPath = Join-Path $PSScriptRoot "lib\sonidos.ps1"

if (-not (Test-Path $sonidosPath)) {
    Write-Host "[ERROR] No se encontró la librería de sonidos en: $sonidosPath" -ForegroundColor Red
    exit 1
}

. $sonidosPath

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Prueba de Sonidos - Mahitek 3D Lab" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Esta prueba reproducirá todos los sonidos disponibles." -ForegroundColor White
Write-Host "Ajusta el volumen de tu sistema si es necesario.`n" -ForegroundColor Yellow

$continuar = Read-Host "Presiona Enter para continuar o 'n' para cancelar"
if ($continuar -eq 'n') {
    Write-Host "Prueba cancelada." -ForegroundColor Gray
    exit 0
}

# Ejecutar prueba de sonidos
Test-Sonidos

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "  Prueba Completada" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "Si no escuchaste ningún sonido:" -ForegroundColor Yellow
Write-Host "  1. Verifica que tu PC tenga altavoces/audífonos conectados" -ForegroundColor White
Write-Host "  2. Revisa el volumen del sistema" -ForegroundColor White
Write-Host "  3. Algunos equipos no soportan [Console]::Beep()`n" -ForegroundColor White

Write-Host "Para deshabilitar sonidos en los scripts:" -ForegroundColor Cyan
Write-Host "  .\scripts\validar-codigo.ps1 -SinSonidos" -ForegroundColor White
Write-Host "  .\scripts\commit-auto.ps1 -SinSonidos`n" -ForegroundColor White
