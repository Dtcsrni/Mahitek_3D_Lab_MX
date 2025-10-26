# Script de Verificación del Workflow CI/CD
# Mahitek 3D Lab MX

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    VERIFICACIÓN DE WORKFLOW CI/CD - MAHITEK 3D LAB MX    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. Verificar estado del repositorio
Write-Host "📁 ESTADO DEL REPOSITORIO LOCAL" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════`n" -ForegroundColor Yellow

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Hay cambios sin commitear:" -ForegroundColor Red
    git status --short
} else {
    Write-Host "✅ Working tree limpio - Todo commiteado" -ForegroundColor Green
}

Write-Host "`n📊 Último commit:" -ForegroundColor Cyan
git log --oneline -1
Write-Host ""

# 2. Verificar sincronización con remoto
Write-Host "`n🔄 SINCRONIZACIÓN CON GITHUB" -ForegroundColor Yellow
Write-Host "═══════════════════════════════`n" -ForegroundColor Yellow

$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main

if ($localCommit -eq $remoteCommit) {
    Write-Host "✅ Local y remoto sincronizados" -ForegroundColor Green
    Write-Host "   Commit: $($localCommit.Substring(0,7))" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Local y remoto NO están sincronizados" -ForegroundColor Red
    Write-Host "   Local:  $($localCommit.Substring(0,7))" -ForegroundColor Gray
    Write-Host "   Remote: $($remoteCommit.Substring(0,7))" -ForegroundColor Gray
    Write-Host "`n💡 Ejecuta: git push origin main" -ForegroundColor Yellow
}

# 3. Verificar archivos del workflow
Write-Host "`n📋 ARCHIVOS DE CONFIGURACIÓN" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════`n" -ForegroundColor Yellow

$workflowFile = ".github/workflows/ci.yml"
if (Test-Path $workflowFile) {
    Write-Host "✅ Workflow CI/CD encontrado" -ForegroundColor Green
    Write-Host "   Archivo: $workflowFile" -ForegroundColor Gray
    $workflowLines = (Get-Content $workflowFile).Count
    Write-Host "   Líneas: $workflowLines" -ForegroundColor Gray
} else {
    Write-Host "❌ Workflow CI/CD NO encontrado" -ForegroundColor Red
}

if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "   Versión: $($packageJson.version)" -ForegroundColor Gray
} else {
    Write-Host "❌ package.json NO encontrado" -ForegroundColor Red
}

# 4. Verificar dependencias
Write-Host "`n📦 DEPENDENCIAS" -ForegroundColor Yellow
Write-Host "═══════════════════`n" -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ node_modules instalado" -ForegroundColor Green
    Write-Host "   Tamaño: $([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "⚠️  node_modules NO instalado" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta: npm install" -ForegroundColor Cyan
}

# 5. Enlaces útiles
Write-Host "`n🌐 ENLACES PARA VERIFICAR WORKFLOW" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Yellow

Write-Host "  1️⃣  Ver todos los workflows:" -ForegroundColor White
Write-Host "     https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions`n" -ForegroundColor Cyan

Write-Host "  2️⃣  Ver workflow CI/CD específico:" -ForegroundColor White
Write-Host "     https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions/workflows/ci.yml`n" -ForegroundColor Cyan

Write-Host "  3️⃣  Ver sitio publicado:" -ForegroundColor White
Write-Host "     https://dtcsrni.github.io/Mahitek_3D_Lab_MX/`n" -ForegroundColor Cyan

Write-Host "  4️⃣  Configuración de GitHub Pages:" -ForegroundColor White
Write-Host "     https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/settings/pages`n" -ForegroundColor Cyan

# 6. Estado esperado del workflow
Write-Host "`n💡 JOBS DEL WORKFLOW CI/CD" -ForegroundColor Yellow
Write-Host "═══════════════════════════════`n" -ForegroundColor Yellow

Write-Host "  🔍 Job 1: Validar Código" -ForegroundColor Cyan
Write-Host "     • Verificar archivos principales" -ForegroundColor Gray
Write-Host "     • Comprobar formateo con Prettier" -ForegroundColor Gray
Write-Host "     • Validar estructura HTML" -ForegroundColor Gray
Write-Host "     ⏱️  Duración: ~2-3 minutos`n" -ForegroundColor DarkGray

Write-Host "  🚀 Job 2: Deploy a GitHub Pages" -ForegroundColor Cyan
Write-Host "     • Configurar GitHub Pages" -ForegroundColor Gray
Write-Host "     • Subir artefactos" -ForegroundColor Gray
Write-Host "     • Publicar sitio" -ForegroundColor Gray
Write-Host "     ⏱️  Duración: ~1-2 minutos`n" -ForegroundColor DarkGray

Write-Host "  📊 Job 3: Auditoría Lighthouse" -ForegroundColor Cyan
Write-Host "     • Esperar propagación (45s)" -ForegroundColor Gray
Write-Host "     • Ejecutar Lighthouse CI" -ForegroundColor Gray
Write-Host "     • Generar reportes" -ForegroundColor Gray
Write-Host "     ⏱️  Duración: ~2-3 minutos`n" -ForegroundColor DarkGray

Write-Host "  ⏱️  TOTAL: 6-8 minutos aproximadamente`n" -ForegroundColor Yellow

# 7. Comandos útiles
Write-Host "`n🛠️  COMANDOS ÚTILES" -ForegroundColor Yellow
Write-Host "═══════════════════════`n" -ForegroundColor Yellow

Write-Host "  • Iniciar servidor de desarrollo:" -ForegroundColor White
Write-Host "    npm run dev`n" -ForegroundColor Cyan

Write-Host "  • Verificar formateo:" -ForegroundColor White
Write-Host "    npm run check:format`n" -ForegroundColor Cyan

Write-Host "  • Formatear código:" -ForegroundColor White
Write-Host "    npm run format`n" -ForegroundColor Cyan

Write-Host "  • Validar HTML:" -ForegroundColor White
Write-Host "    npm run validate:html`n" -ForegroundColor Cyan

Write-Host "  • Ver estado del repositorio:" -ForegroundColor White
Write-Host "    git status`n" -ForegroundColor Cyan

Write-Host "  • Ver últimos commits:" -ForegroundColor White
Write-Host "    git log --oneline -5`n" -ForegroundColor Cyan

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✅ VERIFICACIÓN COMPLETADA                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Opción para abrir enlaces
Write-Host "¿Deseas abrir la página de Actions en el navegador? (S/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'S' -or $response -eq 's') {
    Start-Process "https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions"
    Write-Host "`n✅ Abriendo GitHub Actions en el navegador...`n" -ForegroundColor Green
}
