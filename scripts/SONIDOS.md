# 🔊 Sistema de Retroalimentacion Sonora para IA

Sistema de sonidos sutiles y profesionales para programacion asistida por IA en Mahitek 3D Lab.

## 🎯 Filosofia de Diseño

- ✅ **Sonidos sutiles** en flujos normales (no molestos)
- ✅ **Sonidos claros** solo para alertas/errores
- ✅ **No invasivo** - no interrumpe el flujo de trabajo
- ✅ **Opcional** - se puede deshabilitar facilmente

## 🎵 Tipos de Sonidos

### Flujos Normales (Sutiles)

| Funcion | Patron | Uso | Frecuencia |
|---------|--------|-----|------------|
| `Play-ProcesoIniciado` | 1 tono bajo breve | Al iniciar script | 500 Hz, 70ms |
| `Play-ValidacionOK` | 1 tono suave | Validaciones pasadas | 700 Hz, 60ms |
| `Play-SolicitarConfirmacion` | 1 tono medio | Antes de input | 650 Hz, 100ms |
| `Play-TareaCompletada` | 2 tonos ascendentes | Tarea exitosa | 600→800 Hz |
| `Play-CommitExitoso` | Acorde de 3 notas | Commit creado | 550→650→800 Hz |
| `Play-PushExitoso` | Acorde espaciado | Push exitoso | 600→750→900 Hz |

### Alertas (Mas Notorios)

| Funcion | Patron | Uso | Frecuencia |
|---------|--------|-----|------------|
| `Play-Advertencia` | 2 tonos iguales | Warnings | 550 Hz, 120ms ×2 |
| `Play-TestsFallidos` | 2 tonos bajos | Tests fallan | 450→400 Hz |
| `Play-ErrorCritico` | 3 tonos descendentes | Error grave | 600→500→400 Hz |
| `Play-RiesgoDetectado` | Oscilacion rapida | Alerta urgente | 500↔600 Hz ×3 |

## 🚀 Uso

### Probar Sonidos

```powershell
# Probar todos los sonidos
.\scripts\probar-sonidos.ps1
```

### En Scripts Automatizados

Los sonidos se activan automaticamente en:

**validar-codigo.ps1**:
- 🔔 Al iniciar: sonido suave
- ✅ Si pasa todo: sonido muy sutil
- ⚠️ Si hay warnings: sonido suave
- ❌ Si hay errores: sonido claro

**commit-auto.ps1**:
- 🔔 Al iniciar: sonido suave
- ❓ Antes de confirmar: sonido neutral
- ✅ Commit exitoso: acorde armonioso
- ❓ Antes de push: sonido neutral
- 🚀 Push exitoso: acorde gratificante
- ❌ Si falla: sonido de error

### Deshabilitar Sonidos

```powershell
# Opcion 1: Flag en cada ejecucion
.\scripts\validar-codigo.ps1 -SinSonidos
.\scripts\commit-auto.ps1 -SinSonidos

# Opcion 2: Editar el script
# En sonidos.ps1, cambiar:
$script:SonidosHabilitados = $false
```

## 📊 Frecuencias Usadas

Todas las frecuencias son **armonicas y agradables**:

```
Rango: 400 - 900 Hz
- Graves (400-500 Hz): Errores, finalizacion
- Medios (550-700 Hz): Neutrales, confirmaciones
- Agudos (750-900 Hz): Exitos, completados
```

## ⚙️ Caracteristicas Tecnicas

- **Metodo**: `[Console]::Beep(frecuencia, duracion)`
- **Duraciones**: 60-200ms (muy cortas)
- **Compatibilidad**: Windows nativo
- **Fallback**: Silencioso si no hay hardware de audio
- **Performance**: Sin impacto (<0.5s total)

## 🔧 Personalizacion

### Cambiar Frecuencias

Edita `scripts/lib/sonidos.ps1`:

```powershell
function Play-MiSonidoCustom {
    Play-SonidoSutil -Frecuencia 800 -Duracion 100
    Start-Sleep -Milliseconds 50
    Play-SonidoSutil -Frecuencia 1000 -Duracion 100
}
```

### Agregar Nuevo Sonido

```powershell
function Play-DeployExitoso {
    <#
    .SYNOPSIS
    Sonido para deploy exitoso
    #>
    Play-SonidoSutil -Frecuencia 600 -Duracion 80
    Start-Sleep -Milliseconds 60
    Play-SonidoSutil -Frecuencia 800 -Duracion 80
    Start-Sleep -Milliseconds 60
    Play-SonidoSutil -Frecuencia 1000 -Duracion 100
}
```

## 🎓 Mejores Practicas

### Cuando Usar Sonidos

✅ **SI usar**:
- Proceso completado exitosamente
- Error critico que requiere atencion
- Solicitar confirmacion importante
- Alertas de riesgo

❌ **NO usar**:
- Cada linea de codigo validada
- Logs normales
- Operaciones intermedias
- Debugging rutinario

### Principios de Diseño

1. **Sutil por defecto**: La mayoria de sonidos deben ser muy suaves
2. **Claro cuando importa**: Solo errores criticos son notorios
3. **Armonioso**: Usar frecuencias agradables (no estridentes)
4. **Breve**: Duraciones <200ms para no molestar
5. **Opcional**: Siempre permitir deshabilitar

## 🌟 Ejemplos de Uso

### Ejemplo 1: Validacion Exitosa

```powershell
# Ejecutar validacion
.\scripts\validar-codigo.ps1

# Escucharas:
# 1. [Inicio] Tono suave (proceso iniciado)
# 2. [Fin] Tono muy sutil (validacion OK)
```

### Ejemplo 2: Commit Completo

```powershell
# Ejecutar commit automatizado
.\scripts\commit-auto.ps1

# Escucharas:
# 1. [Inicio] Tono suave
# 2. [Confirmar] Tono neutral (antes de Read-Host)
# 3. [Commit] Acorde armonioso (commit exitoso)
# 4. [Push?] Tono neutral (antes de Read-Host)
# 5. [Push] Acorde gratificante (push exitoso)
```

### Ejemplo 3: Error Critico

```powershell
# Si hay errores de validacion
.\scripts\validar-codigo.ps1

# Escucharas:
# 1. [Inicio] Tono suave
# 2. [Error] 3 tonos descendentes (error critico)
```

## 🛠️ Troubleshooting

### No escucho ningun sonido

**Posibles causas**:
1. Hardware de audio no disponible
2. Volumen del sistema muy bajo
3. Driver de audio no instalado
4. Sonidos deshabilitados con `-SinSonidos`

**Soluciones**:
```powershell
# Verificar que funciona
[Console]::Beep(800, 200)

# Si no funciona, es problema de hardware
# Los scripts funcionaran normal sin sonido
```

### Los sonidos son molestos

```powershell
# Deshabilitar permanentemente
# Editar scripts/lib/sonidos.ps1:
$script:SonidosHabilitados = $false

# O usar flag en cada ejecucion
.\scripts\validar-codigo.ps1 -SinSonidos
```

### Quiero sonidos mas largos/fuertes

```powershell
# Editar scripts/lib/sonidos.ps1
# Cambiar duraciones (en ms) y frecuencias (en Hz)
Play-SonidoSutil -Frecuencia 1000 -Duracion 300
```

## 📈 Beneficios

1. **Retroalimentacion inmediata** sin mirar pantalla
2. **Awareness** de estado del proceso
3. **Productividad** - continua trabajando mientras ejecuta
4. **Satisfaccion** - sonidos de exito gratificantes
5. **Alertas** - errores no pasan desapercibidos

## 🎯 Roadmap

Posibles mejoras futuras:

- [ ] Archivos WAV personalizados (mas profesional)
- [ ] Configuracion de volumen relativo
- [ ] Temas de sonidos (clasico, moderno, cyberpunk)
- [ ] Sonidos para GitHub Actions (notificaciones)
- [ ] Integracion con notificaciones de Windows
- [ ] Soporte para macOS/Linux (diferentes APIs)

---

**Desarrollado por**: Mahitek 3D Lab  
**Version**: 1.0.0  
**Fecha**: Octubre 2025
