# ===== Librería de Sonidos para IA - Mahitek 3D Lab =====
# cspell:ignore Validacion Confirmacion Opcion Categoria Navegacion Interaccion Retroalimentacion Compilacion Desconexion ErrorCritico Duracion duracion Minimalista minimalista rapida
# Diseño basado en investigación de UX sonoro (ISO 9241-910, Norman 2013, Gaver 1986)
# Optimizado para ambiente de desarrollo nocturno con estética cyberpunk
# Frecuencias bajas y medias (evita fatiga auditiva - Weber-Fechner Law)

# Configuración
$script:SonidosHabilitados = $true
$script:PerfilSonido = "Nocturno"  # Nocturno, Diurno, Silencioso

# Parámetros de diseño UX sonoro:
# - Rango: 200-600 Hz (graves/medios, menos fatigantes)
# - Duración: 40-120ms (mínimo cognitivo según Miller 1956)
# - Espaciado: 30-80ms (evita enmascaramiento auditivo)
# - Patrón: Ascendente = éxito, Descendente = error (universal)

# ===== Funciones Base =====

function Play-SonidoSutil {
    param(
        [int]$Frecuencia = 400,
        [int]$Duracion = 60,
        [int]$Volumen = 100  # Placeholder para futura implementación
    )
    if ($script:SonidosHabilitados) {
        try {
            # Ajustar frecuencia según perfil
            if ($script:PerfilSonido -eq "Nocturno") {
                $Frecuencia = [Math]::Max(200, $Frecuencia - 100)  # Mas grave
            }
            [Console]::Beep($Frecuencia, $Duracion)
        } catch {
            # Silenciar errores si no hay hardware de audio
        }
    }
}

function Play-Silencio {
    param([int]$Duracion = 50)
    Start-Sleep -Milliseconds $Duracion
}

# ===== Categoría 1: Sonidos de Sistema (Muy Sutiles) =====

function Play-SistemaIniciado {
    <#
    .SYNOPSIS
    Sonido al iniciar sistema - Pulso bajo cyberpunk
    Patrón: Tono grave breve (como encender terminal)
    Frecuencia: 220 Hz (A3 - nota musical baja)
    #>
    Play-SonidoSutil -Frecuencia 220 -Duracion 40
}

function Play-ProcesoIniciado {
    <#
    .SYNOPSIS
    Sonido al iniciar proceso largo - Eco bajo
    Patrón: Dos pulsos graves rápidos
    investigación: Sonidos graves indican "carga" sin ansiedad (Gaver 1986)
    #>
    Play-SonidoSutil -Frecuencia 240 -Duracion 45
    Play-Silencio -Duracion 25
    Play-SonidoSutil -Frecuencia 220 -Duracion 45
}

function Play-CargandoDatos {
    <#
    .SYNOPSIS
    Sonido de carga de datos - Pulso rítmico
    Patrón: Tres pulsos suaves descendentes
    #>
    Play-SonidoSutil -Frecuencia 280 -Duracion 35
    Play-Silencio -Duracion 30
    Play-SonidoSutil -Frecuencia 260 -Duracion 35
    Play-Silencio -Duracion 30
    Play-SonidoSutil -Frecuencia 240 -Duracion 35
}

# ===== Categoría 2: Retroalimentación Positiva (Ascendente) =====

function Play-TareaCompletada {
    <#
    .SYNOPSIS
    Sonido de tarea exitosa - Acorde menor cyberpunk
    Patrón: Tres tonos ascendentes espaciados
    Psicología: Ascenso = éxito (universal cross-cultural)
    Frecuencias: D3 → F3 → A3 (acorde menor armónico)
    #>
    Play-SonidoSutil -Frecuencia 293 -Duracion 60
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 349 -Duracion 60
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 440 -Duracion 70
}

function Play-ValidacionOK {
    <#
    .SYNOPSIS
    Validación pasada - Click sutil cyberpunk
    Patrón: Dos pulsos rápidos ascendentes
    Diseño: Minimalista, no invasivo (Nielsen 10 Heuristics)
    #>
    Play-SonidoSutil -Frecuencia 330 -Duracion 40
    Play-Silencio -Duracion 20
    Play-SonidoSutil -Frecuencia 370 -Duracion 40
}

function Play-CommitExitoso {
    <#
    .SYNOPSIS
    Commit creado - Secuencia de Confirmación cyberpunk
    Patrón: Cuatro tonos ascendentes con ritmo
    Frecuencias: C3 → E3 → G3 → C4 (acorde mayor, confianza)
    #>
    Play-SonidoSutil -Frecuencia 261 -Duracion 55
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 329 -Duracion 55
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 392 -Duracion 55
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 523 -Duracion 65
}

function Play-PushExitoso {
    <#
    .SYNOPSIS
    Push completado - Secuencia de transmisión cyberpunk
    Patrón: Cinco tonos ascendentes con Aceleración
    investigación: Aceleración rítmica = "envío completado" (Blattner 1989)
    #>
    Play-SonidoSutil -Frecuencia 277 -Duracion 50
    Play-Silencio -Duracion 50
    Play-SonidoSutil -Frecuencia 330 -Duracion 50
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 392 -Duracion 50
    Play-Silencio -Duracion 30
    Play-SonidoSutil -Frecuencia 466 -Duracion 50
    Play-Silencio -Duracion 20
    Play-SonidoSutil -Frecuencia 554 -Duracion 60
}

function Play-DeployExitoso {
    <#
    .SYNOPSIS
    Deploy completo - Fanfarria cyberpunk minimalista
    Patrón: Arpegio ascendente espaciado
    #>
    Play-SonidoSutil -Frecuencia 220 -Duracion 50
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 277 -Duracion 50
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 330 -Duracion 50
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 440 -Duracion 70
}

# ===== Categoría 3: Interacción Usuario (Neutral) =====

function Play-SolicitarConfirmacion {
    <#
    .SYNOPSIS
    Solicitar input - Tono interrogativo
    Patrón: Tono medio estable (neutral, sin sesgo)
    Frecuencia: 330 Hz (E4 - tono neutro universal)
    #>
    Play-SonidoSutil -Frecuencia 330 -Duracion 70
}

function Play-OpcionSeleccionada {
    <#
    .SYNOPSIS
    Usuario selecciono Opción - Click de Confirmación
    Patrón: Pulso único corto
    #>
    Play-SonidoSutil -Frecuencia 370 -Duracion 40
}

function Play-MenuNavegacion {
    <#
    .SYNOPSIS
    Navegación en menu - Tick sutil
    Patrón: Pulso muy breve
    #>
    Play-SonidoSutil -Frecuencia 350 -Duracion 30
}

function Play-InputRecibido {
    <#
    .SYNOPSIS
    Input recibido del usuario - Eco de Confirmación
    Patrón: Dos pulsos iguales
    #>
    Play-SonidoSutil -Frecuencia 310 -Duracion 40
    Play-Silencio -Duracion 30
    Play-SonidoSutil -Frecuencia 310 -Duracion 40
}

# ===== Categoría 4: Alertas y Advertencias (Descendente) =====

function Play-Advertencia {
    <#
    .SYNOPSIS
    Advertencia menor - Patrón de alerta cyberpunk
    Patrón: Dos tonos medios con pequeña oscilación
    Psicología: Tono medio-alto sin descender = "atención" sin pánico
    #>
    Play-SonidoSutil -Frecuencia 400 -Duracion 65
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 380 -Duracion 65
}

function Play-TestsFallidos {
    <#
    .SYNOPSIS
    Tests fallaron - Descenso grave
    Patrón: Tres tonos descendentes (indica "falla")
    Weber-Fechner: Descenso perceptible pero no agresivo
    #>
    Play-SonidoSutil -Frecuencia 330 -Duracion 70
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 293 -Duracion 70
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 261 -Duracion 80
}

function Play-ErrorCritico {
    <#
    .SYNOPSIS
    Error critico - Secuencia descendente enfática
    Patrón: Cuatro tonos descendentes con espaciado
    investigación: Descenso rápido = urgencia (Norman 2013)
    Frecuencias: A3 → F#3 → E3 → D3 (tension armonica)
    #>
    Play-SonidoSutil -Frecuencia 440 -Duracion 75
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 370 -Duracion 75
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 330 -Duracion 75
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 293 -Duracion 90
}

function Play-RiesgoDetectado {
    <#
    .SYNOPSIS
    Riesgo detectado - oscilación de alerta
    Patrón: Cuatro pulsos alternantes (efecto "sirena" sutil)
    ISO 9241-910: Patrón alternante indica "verificar"
    #>
    Play-SonidoSutil -Frecuencia 350 -Duracion 60
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 400 -Duracion 60
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 350 -Duracion 60
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 400 -Duracion 60
}

function Play-ConflictoGit {
    <#
    .SYNOPSIS
    Conflicto de merge - Patrón de colisión
    Patrón: Dos tonos simultáneos (disonancia)
    #>
    Play-SonidoSutil -Frecuencia 277 -Duracion 80
    Play-Silencio -Duracion 20
    Play-SonidoSutil -Frecuencia 293 -Duracion 80
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 277 -Duracion 80
}

function Play-ErrorSintaxis {
    <#
    .SYNOPSIS
    Error de sintaxis - Glitch rápido
    Patrón: Tres pulsos muy rápidos descendentes
    #>
    Play-SonidoSutil -Frecuencia 370 -Duracion 35
    Play-Silencio -Duracion 20
    Play-SonidoSutil -Frecuencia 350 -Duracion 35
    Play-Silencio -Duracion 20
    Play-SonidoSutil -Frecuencia 330 -Duracion 35
}

# ===== Categoría 5: Sonidos Especiales Cyberpunk =====

function Play-ScanIniciado {
    <#
    .SYNOPSIS
    Escaneo de archivos iniciado - Barrido digital
    Patrón: Seis pulsos ascendentes rápidos (efecto "scanner")
    #>
    Play-SonidoSutil -Frecuencia 220 -Duracion 30
    Play-Silencio -Duracion 25
    Play-SonidoSutil -Frecuencia 247 -Duracion 30
    Play-Silencio -Duracion 25
    Play-SonidoSutil -Frecuencia 277 -Duracion 30
    Play-Silencio -Duracion 25
    Play-SonidoSutil -Frecuencia 311 -Duracion 30
    Play-Silencio -Duracion 25
    Play-SonidoSutil -Frecuencia 349 -Duracion 30
    Play-Silencio -Duracion 25
    Play-SonidoSutil -Frecuencia 392 -Duracion 30
}

function Play-DataStream {
    <#
    .SYNOPSIS
    Stream de datos - Pulso continuo de transferencia
    Patrón: Cuatro pulsos rápidos idénticos (efecto "transmisión")
    #>
    $freq = 310
    for ($i = 0; $i -lt 4; $i++) {
        Play-SonidoSutil -Frecuencia $freq -Duracion 35
        Play-Silencio -Duracion 25
    }
}

function Play-GitPull {
    <#
    .SYNOPSIS
    Pull de repositorio - Descarga de datos
    Patrón: Descendente lento (datos "bajando")
    #>
    Play-SonidoSutil -Frecuencia 440 -Duracion 50
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 392 -Duracion 50
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 349 -Duracion 50
    Play-Silencio -Duracion 35
    Play-SonidoSutil -Frecuencia 311 -Duracion 60
}

function Play-BuildIniciado {
    <#
    .SYNOPSIS
    Compilación iniciada - Motor encendiendo
    Patrón: Tres pulsos graves acelerando
    #>
    Play-SonidoSutil -Frecuencia 220 -Duracion 60
    Play-Silencio -Duracion 50
    Play-SonidoSutil -Frecuencia 233 -Duracion 55
    Play-Silencio -Duracion 40
    Play-SonidoSutil -Frecuencia 247 -Duracion 50
}

function Play-BreakpointHit {
    <#
    .SYNOPSIS
    Breakpoint alcanzado - Pausa digital
    Patrón: Pulso único enfático
    #>
    Play-SonidoSutil -Frecuencia 277 -Duracion 90
}

function Play-AIThinking {
    <#
    .SYNOPSIS
    IA procesando - Patrón de pensamiento
    Patrón: oscilación sutil (efecto "computando")
    #>
    Play-SonidoSutil -Frecuencia 330 -Duracion 45
    Play-Silencio -Duracion 30
    Play-SonidoSutil -Frecuencia 349 -Duracion 45
    Play-Silencio -Duracion 30
    Play-SonidoSutil -Frecuencia 330 -Duracion 45
}

function Play-NetworkError {
    <#
    .SYNOPSIS
    Error de red - Desconexión
    Patrón: Tres pulsos descendentes con espaciado largo
    #>
    Play-SonidoSutil -Frecuencia 370 -Duracion 60
    Play-Silencio -Duracion 60
    Play-SonidoSutil -Frecuencia 330 -Duracion 60
    Play-Silencio -Duracion 60
    Play-SonidoSutil -Frecuencia 293 -Duracion 70
}

function Play-SistemaAlerta {
    <#
    .SYNOPSIS
    Alerta critica de sistema - Patrón de emergencia
    Patrón: Alternancia rapida enfática (solo para emergencias)
    Nota: Más fuerte que otros sonidos (romper Patrón solo si critico)
    #>
    for ($i = 0; $i -lt 3; $i++) {
        Play-SonidoSutil -Frecuencia 440 -Duracion 80
        Play-Silencio -Duracion 40
        Play-SonidoSutil -Frecuencia 370 -Duracion 80
        Play-Silencio -Duracion 40
    }
}

# ===== Funciones de Control y Testing =====

function Set-SonidosHabilitados {
    param([bool]$Habilitado = $true)
    $script:SonidosHabilitados = $Habilitado
    if ($Habilitado) {
        Write-Host "[AUDIO] Sonidos habilitados" -ForegroundColor Cyan
    } else {
        Write-Host "[AUDIO] Sonidos deshabilitados" -ForegroundColor Gray
    }
}

function Set-PerfilSonido {
    <#
    .SYNOPSIS
    Cambia el perfil de sonidos
    #>
    param(
        [Parameter(Mandatory=$true)]
        [ValidateSet("Nocturno", "Diurno", "Silencioso")]
        [string]$Perfil
    )
    
    $script:PerfilSonido = $Perfil
    Write-Host "[AUDIO] Perfil cambiado a: $Perfil" -ForegroundColor Cyan
    
    if ($Perfil -eq "Nocturno") {
        Write-Host "        Frecuencias reducidas en 100 Hz (modo nocturno)" -ForegroundColor DarkCyan
    } elseif ($Perfil -eq "Diurno") {
        Write-Host "        Frecuencias normales (200-600 Hz)" -ForegroundColor DarkCyan
    } else {
        Write-Host "        Modo silencioso activado" -ForegroundColor DarkGray
    }
}

function Test-Sonidos {
    <#
    .SYNOPSIS
    Prueba todos los sonidos disponibles con frecuencias cyberpunk
    #>
    Write-Host "`n======================================" -ForegroundColor Magenta
    Write-Host "  SISTEMA DE SONIDOS CYBERPUNK v2.0" -ForegroundColor Cyan
    Write-Host "  Frecuencias: 200-600 Hz (Nocturno)" -ForegroundColor DarkCyan
    Write-Host "======================================`n" -ForegroundColor Magenta
    
    Write-Host "[INFO] Categoría 1: Sistema" -ForegroundColor Yellow
    Write-Host "  [1.1] Sistema Iniciado (220 Hz):"
    Play-SistemaIniciado
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [1.2] Proceso Iniciado (240-220 Hz):"
    Play-ProcesoIniciado
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [1.3] Cargando Datos (280-240 Hz):"
    Play-CargandoDatos
    Start-Sleep -Milliseconds 800
    
    Write-Host "`n[INFO] Categoría 2: Retroalimentación Positiva" -ForegroundColor Green
    Write-Host "  [2.1] Tarea Completada (acorde D-F-A):"
    Play-TareaCompletada
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [2.2] Validación OK (330-370 Hz):"
    Play-ValidacionOK
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [2.3] Commit Exitoso (acorde C-E-G-C):"
    Play-CommitExitoso
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [2.4] Push Exitoso (277-554 Hz ascendente):"
    Play-PushExitoso
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [2.5] Deploy Exitoso (220-440 Hz arpegio):"
    Play-DeployExitoso
    Start-Sleep -Milliseconds 800
    
    Write-Host "`n[INFO] Categoría 3: Interacción Usuario" -ForegroundColor Cyan
    Write-Host "  [3.1] Solicitar Confirmación (330 Hz neutral):"
    Play-SolicitarConfirmacion
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [3.2] Opción Seleccionada (370 Hz click):"
    Play-OpcionSeleccionada
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [3.3] Menu Navegación (350 Hz tick):"
    Play-MenuNavegacion
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [3.4] Input Recibido (310 Hz eco):"
    Play-InputRecibido
    Start-Sleep -Milliseconds 800
    
    Write-Host "`n[WARN] Categoría 4: Alertas y Advertencias" -ForegroundColor Yellow
    Write-Host "  [4.1] Advertencia (400-380 Hz oscilante):"
    Play-Advertencia
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [4.2] Tests Fallidos (330-261 Hz descendente):"
    Play-TestsFallidos
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [4.3] Error Critico (440-293 Hz tension):"
    Play-ErrorCritico
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [4.4] Riesgo Detectado (350-400 Hz sirena):"
    Play-RiesgoDetectado
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [4.5] Conflicto Git (277-293 Hz disonante):"
    Play-ConflictoGit
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [4.6] Error Sintaxis (370-330 Hz glitch):"
    Play-ErrorSintaxis
    Start-Sleep -Milliseconds 800
    
    Write-Host "`n[INFO] Categoría 5: Sonidos Cyberpunk Especiales" -ForegroundColor Magenta
    Write-Host "  [5.1] Scan Iniciado (220-392 Hz barrido):"
    Play-ScanIniciado
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.2] Data Stream (310 Hz pulsos):"
    Play-DataStream
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.3] Git Pull (440-311 Hz descarga):"
    Play-GitPull
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.4] Build Iniciado (220-247 Hz motor):"
    Play-BuildIniciado
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.5] Breakpoint Hit (277 Hz pausa):"
    Play-BreakpointHit
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.6] IA Thinking (330-349 Hz pensando):"
    Play-AIThinking
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.7] Network Error (370-293 Hz Desconexión):"
    Play-NetworkError
    Start-Sleep -Milliseconds 800
    
    Write-Host "  [5.8] Sistema Alerta (440-370 Hz emergencia):"
    Play-SistemaAlerta
    Start-Sleep -Milliseconds 800
    
    Write-Host "`n======================================" -ForegroundColor Magenta
    Write-Host "  PRUEBA COMPLETADA - 23 SONIDOS" -ForegroundColor Cyan
    Write-Host "  Perfil actual: $script:PerfilSonido" -ForegroundColor DarkCyan
    Write-Host "======================================`n" -ForegroundColor Magenta
}

# Nota: Las funciones están disponibles al cargar este script con dot-sourcing (. .\sonidos.ps1)





