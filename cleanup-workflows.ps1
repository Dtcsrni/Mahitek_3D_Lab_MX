# 🧹 Script de Limpieza de Workflows Fallidos
# Este script elimina workflows fallidos de manera segura
# NO afecta tu código ni configuración

Write-Host "`n🧹 LIMPIEZA DE WORKFLOWS FALLIDOS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray

# Verificar si GitHub CLI está instalado
Write-Host "🔍 Verificando GitHub CLI..." -ForegroundColor Yellow
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghInstalled) {
    Write-Host "❌ GitHub CLI no está instalado`n" -ForegroundColor Red
    Write-Host "📦 Para instalar GitHub CLI:" -ForegroundColor Cyan
    Write-Host "  1. Con Chocolatey (recomendado):"
    Write-Host "     choco install gh`n"
    Write-Host "  2. Con winget:"
    Write-Host "     winget install GitHub.cli`n"
    Write-Host "  3. Descarga manual:"
    Write-Host "     https://cli.github.com/`n"
    
    Write-Host "`n📝 ALTERNATIVA - Limpieza Manual:" -ForegroundColor Magenta
    Write-Host "  1. Abre: https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions"
    Write-Host "  2. Haz clic en cada workflow fallido (❌)"
    Write-Host "  3. Haz clic en '...' → 'Delete workflow run'"
    Write-Host "  4. Confirma la eliminación`n"
    
    exit 1
}

Write-Host "✅ GitHub CLI instalado`n" -ForegroundColor Green

# Autenticar (si es necesario)
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ No estás autenticado. Iniciando sesión...`n" -ForegroundColor Yellow
    gh auth login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al autenticar. Abortando.`n" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Autenticado correctamente`n" -ForegroundColor Green

# Listar workflows fallidos
Write-Host "📋 Listando workflows fallidos..." -ForegroundColor Cyan
$failedRuns = gh run list --repo Dtcsrni/Mahitek_3D_Lab_MX --status failure --limit 50 --json databaseId,name,conclusion,createdAt

if ($failedRuns) {
    $runs = $failedRuns | ConvertFrom-Json
    $runCount = $runs.Count
    
    Write-Host "❌ Encontrados $runCount workflows fallidos`n" -ForegroundColor Red
    
    # Mostrar lista
    Write-Host "Workflows a eliminar:" -ForegroundColor Yellow
    $runs | ForEach-Object {
        Write-Host "  • $($_.name) (ID: $($_.databaseId)) - $($_.createdAt)"
    }
    
    Write-Host "`n⚠️ ¿Deseas eliminar estos workflows?" -ForegroundColor Yellow
    Write-Host "   Esto NO afectará tu código ni configuración.`n"
    
    $confirm = Read-Host "Escribe 'SI' para confirmar"
    
    if ($confirm -eq 'SI') {
        Write-Host "`n🗑️ Eliminando workflows fallidos...`n" -ForegroundColor Cyan
        
        $deleted = 0
        $failed = 0
        
        foreach ($run in $runs) {
            Write-Host "  Eliminando: $($run.name) (ID: $($run.databaseId))..." -NoNewline
            
            try {
                gh run delete $run.databaseId --repo Dtcsrni/Mahitek_3D_Lab_MX --yes 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host " ✅" -ForegroundColor Green
                    $deleted++
                } else {
                    Write-Host " ⚠️ (puede estar protegido)" -ForegroundColor Yellow
                    $failed++
                }
            } catch {
                Write-Host " ❌ Error" -ForegroundColor Red
                $failed++
            }
            
            Start-Sleep -Milliseconds 500  # Evitar rate limiting
        }
        
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host "`n✅ LIMPIEZA COMPLETADA" -ForegroundColor Green
        Write-Host "  • Eliminados: $deleted workflows" -ForegroundColor Green
        if ($failed -gt 0) {
            Write-Host "  • No eliminados: $failed workflows (pueden estar protegidos)" -ForegroundColor Yellow
        }
        Write-Host "`n📍 Verifica el resultado en:" -ForegroundColor Cyan
        Write-Host "   https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions`n"
        
    } else {
        Write-Host "`n⏸️ Operación cancelada. No se eliminó nada.`n" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "✅ No se encontraron workflows fallidos. Todo limpio!`n" -ForegroundColor Green
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor DarkGray
