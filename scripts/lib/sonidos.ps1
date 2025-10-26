# ===== Libreria de Sonidos para IA - Mahitek 3D Lab =====
# Sonidos suaves y profesionales para retroalimentacion en programacion asistida
# Solo se activan en momentos clave para no interrumpir el flujo

# Configuracion
$script:SonidosHabilitados = $true
$script:VolumenBase = 600  # Frecuencia base suave

# ===== Funciones de Sonido =====

function Play-SonidoSutil {
    param([int]$Frecuencia = 800, [int]$Duracion = 100)
    if ($script:SonidosHabilitados) {
        try {
            [Console]::Beep($Frecuencia, $Duracion)
        } catch {
            # Silenciar errores si no hay hardware de audio
        }
    }
}

# ===== Sonidos de Retroalimentacion IA =====

function Play-TareaCompletada {
    <#
    .SYNOPSIS
    Sonido suave al completar tarea exitosamente
    Patron: Dos tonos ascendentes suaves
    #>
    Play-SonidoSutil -Frecuencia 600 -Duracion 80
    Start-Sleep -Milliseconds 50
    Play-SonidoSutil -Frecuencia 800 -Duracion 80
}

function Play-ValidacionOK {
    <#
    .SYNOPSIS
    Sonido muy suave al pasar validaciones
    Patron: Un tono breve y agradable
    #>
    Play-SonidoSutil -Frecuencia 700 -Duracion 60
}

function Play-SolicitarConfirmacion {
    <#
    .SYNOPSIS
    Sonido suave al solicitar input del usuario
    Patron: Tono medio suave
    #>
    Play-SonidoSutil -Frecuencia 650 -Duracion 100
}

function Play-ProcesoIniciado {
    <#
    .SYNOPSIS
    Sonido muy suave al iniciar proceso largo
    Patron: Tono bajo breve
    #>
    Play-SonidoSutil -Frecuencia 500 -Duracion 70
}

# ===== Sonidos de Alerta (mas notorios pero no molestos) =====

function Play-Advertencia {
    <#
    .SYNOPSIS
    Sonido moderado para advertencias
    Patron: Dos tonos iguales espaciados
    #>
    Play-SonidoSutil -Frecuencia 550 -Duracion 120
    Start-Sleep -Milliseconds 100
    Play-SonidoSutil -Frecuencia 550 -Duracion 120
}

function Play-ErrorCritico {
    <#
    .SYNOPSIS
    Sonido mas notorio para errores criticos
    Patron: Tres tonos descendentes
    #>
    Play-SonidoSutil -Frecuencia 600 -Duracion 150
    Start-Sleep -Milliseconds 80
    Play-SonidoSutil -Frecuencia 500 -Duracion 150
    Start-Sleep -Milliseconds 80
    Play-SonidoSutil -Frecuencia 400 -Duracion 200
}

function Play-RiesgoDetectado {
    <#
    .SYNOPSIS
    Sonido de alerta para riesgos potenciales
    Patron: Tonos oscilantes rapidos
    #>
    for ($i = 0; $i -lt 3; $i++) {
        Play-SonidoSutil -Frecuencia 500 -Duracion 80
        Start-Sleep -Milliseconds 50
        Play-SonidoSutil -Frecuencia 600 -Duracion 80
        Start-Sleep -Milliseconds 50
    }
}

# ===== Sonidos de Flujo de Trabajo =====

function Play-CommitExitoso {
    <#
    .SYNOPSIS
    Sonido armonioso para commit exitoso
    Patron: Acorde ascendente suave
    #>
    Play-SonidoSutil -Frecuencia 550 -Duracion 70
    Start-Sleep -Milliseconds 40
    Play-SonidoSutil -Frecuencia 650 -Duracion 70
    Start-Sleep -Milliseconds 40
    Play-SonidoSutil -Frecuencia 800 -Duracion 90
}

function Play-PushExitoso {
    <#
    .SYNOPSIS
    Sonido gratificante para push exitoso
    Patron: Tres tonos ascendentes espaciados
    #>
    Play-SonidoSutil -Frecuencia 600 -Duracion 80
    Start-Sleep -Milliseconds 60
    Play-SonidoSutil -Frecuencia 750 -Duracion 80
    Start-Sleep -Milliseconds 60
    Play-SonidoSutil -Frecuencia 900 -Duracion 100
}

function Play-TestsFallidos {
    <#
    .SYNOPSIS
    Sonido suave pero claro para tests fallidos
    Patron: Dos tonos bajos
    #>
    Play-SonidoSutil -Frecuencia 450 -Duracion 150
    Start-Sleep -Milliseconds 100
    Play-SonidoSutil -Frecuencia 400 -Duracion 150
}

# ===== Funciones de Control =====

function Set-SonidosHabilitados {
    param([bool]$Habilitado = $true)
    $script:SonidosHabilitados = $Habilitado
    if ($Habilitado) {
        Write-Host "[AUDIO] Sonidos habilitados" -ForegroundColor Cyan
    } else {
        Write-Host "[AUDIO] Sonidos deshabilitados" -ForegroundColor Gray
    }
}

function Test-Sonidos {
    <#
    .SYNOPSIS
    Prueba todos los sonidos disponibles
    #>
    Write-Host "`n=== Probando Sonidos de Retroalimentacion ===" -ForegroundColor Magenta
    
    Write-Host "`n[1] Tarea Completada (exito suave):"
    Play-TareaCompletada
    Start-Sleep -Seconds 1
    
    Write-Host "[2] Validacion OK (muy sutil):"
    Play-ValidacionOK
    Start-Sleep -Seconds 1
    
    Write-Host "[3] Solicitar Confirmacion (neutral):"
    Play-SolicitarConfirmacion
    Start-Sleep -Seconds 1
    
    Write-Host "[4] Advertencia (moderado):"
    Play-Advertencia
    Start-Sleep -Seconds 1
    
    Write-Host "[5] Error Critico (notorio):"
    Play-ErrorCritico
    Start-Sleep -Seconds 1
    
    Write-Host "[6] Riesgo Detectado (alerta):"
    Play-RiesgoDetectado
    Start-Sleep -Seconds 1
    
    Write-Host "[7] Commit Exitoso (armonioso):"
    Play-CommitExitoso
    Start-Sleep -Seconds 1
    
    Write-Host "[8] Push Exitoso (gratificante):"
    Play-PushExitoso
    Start-Sleep -Seconds 1
    
    Write-Host "[9] Tests Fallidos (suave pero claro):"
    Play-TestsFallidos
    
    Write-Host "`n=== Prueba Completada ===" -ForegroundColor Magenta
}

# Nota: Las funciones estan disponibles al cargar este script con dot-sourcing (. .\sonidos.ps1)
