# 🔊 Sistema de retroalimentación Sonora para IA
<!-- cspell:ignore Validacion Confirmacion Opcion Categoria Navegacion -->

Sistema de sonidos sutiles y profesionales para programación asistida por IA en Mahitek 3D Lab.

## 🎯 filosofía de Diseño

- ✅ **Sonidos sutiles** en flujos normales (no molestos)
- ✅ **Sonidos claros** solo para alertas/errores
- ✅ **No invasivo** - no interrumpe el flujo de trabajo
- ✅ **Opcional** - se puede deshabilitar fácilmente

## 🎵 Tipos de Sonidos

### Flujos Normales (Sutiles)

| Función | Patrón | Uso | Frecuencia |
|---------|--------|-----|------------|
| `Play-ProcesoIniciado` | 1 tono bajo breve | Al iniciar script | 500 Hz, 70ms |
| `Play-ValidacionOK` | 1 tono suave | Validaciones pasadas | 700 Hz, 60ms |
| `Play-SolicitarConfirmacion` | 1 tono medio | Antes de input | 650 Hz, 100ms |
| `Play-TareaCompletada` | 2 tonos ascendentes | Tarea exitosa | 600→800 Hz |
| `Play-CommitExitoso` | Acorde de 3 notas | Commit creado | 550→650→800 Hz |
| `Play-PushExitoso` | Acorde espaciado | Push exitoso | 600→750→900 Hz |

### Alertas (Más Notorios)

| Función | Patrón | Uso | Frecuencia |
|---------|--------|-----|------------|
| `Play-Advertencia` | 2 tonos iguales | Warnings | 550 Hz, 120ms ×2 |
| `Play-TestsFallidos` | 2 tonos bajos | Tests fallan | 450→400 Hz |
| `Play-ErrorCritico` | 3 tonos descendentes | Error grave | 600→500→400 Hz |
| `Play-RiesgoDetectado` | oscilación rápida | Alerta urgente | 500↔600 Hz ×3 |

## 🚀 Uso

### Probar Sonidos

```powershell
# Probar todos los sonidos
.\scripts\probar-sonidos.ps1
```

### En Scripts Automatizados

Los sonidos se activan automáticamente en:

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
# opción 1: Flag en cada ejecución
.\scripts\validar-codigo.ps1 -SinSonidos
.\scripts\commit-auto.ps1 -SinSonidos

# opción 2: Editar el script
# En sonidos.ps1, cambiar:
$script:SonidosHabilitados = $false
```

## 📊 Frecuencias Usadas

Todas las frecuencias son **armónicas y agradables**:

```
Rango: 400 - 900 Hz
- Graves (400-500 Hz): Errores, finalización
- Medios (550-700 Hz): Neutrales, confirmaciones
- Agudos (750-900 Hz): Éxitos, completados
```

## ⚙️ características técnicas

- **método**: `[Console]::Beep(frecuencia, duración)`
- **Duraciones**: 60-200ms (muy cortas)
- **Compatibilidad**: Windows nativo
- **Fallback**: Silencioso si no hay hardware de audio
- **Performance**: Sin impacto (<0.5s total)

## 🔧 personalización

### Cambiar Frecuencias

Edita `scripts/lib/sonidos.ps1`:

```powershell
function Play-MiSonidoCustom {
    Play-SonidoSutil -Frecuencia 800 -duración 100
    Start-Sleep -Milliseconds 50
    Play-SonidoSutil -Frecuencia 1000 -duración 100
}
```

### Agregar Nuevo Sonido

```powershell
function Play-DeployExitoso {
    <#
    .SYNOPSIS
    Sonido para deploy exitoso
    #>
    Play-SonidoSutil -Frecuencia 600 -duración 80
    Start-Sleep -Milliseconds 60
    Play-SonidoSutil -Frecuencia 800 -duración 80
    Start-Sleep -Milliseconds 60
    Play-SonidoSutil -Frecuencia 1000 -duración 100
}
```

## 🎓 Mejores Practicas

### Cuando Usar Sonidos

✅ **SI usar**:
- Proceso completado exitosamente
- Error critico que requiere atención
- Solicitar confirmación importante
- Alertas de riesgo

❌ **NO usar**:
- Cada linea de código validada
- Logs normales
- Operaciones intermedias
- Debugging rutinario

### Principios de Diseño

1. **Sutil por defecto**: La mayoría de sonidos deben ser muy suaves
2. **Claro cuando importa**: Solo errores críticos son notorios
3. **Armonioso**: Usar frecuencias agradables (no estridentes)
4. **Breve**: Duraciones <200ms para no molestar
5. **Opcional**: Siempre permitir deshabilitar

## 🌟 Ejemplos de Uso

### Ejemplo 1: validación Exitosa

```powershell
# Ejecutar validación
.\scripts\validar-codigo.ps1

# Escucharas:
# 1. [Inicio] Tono suave (proceso iniciado)
# 2. [Fin] Tono muy sutil (validación OK)
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
# Si hay errores de validación
.\scripts\validar-codigo.ps1

# Escucharas:
# 1. [Inicio] Tono suave
# 2. [Error] 3 tonos descendentes (error critico)
```

## 🛠️ Troubleshooting

### No escucho ningún sonido

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

# O usar flag en cada ejecución
.\scripts\validar-codigo.ps1 -SinSonidos
```

### Quiero sonidos mas largos/fuertes

```powershell
# Editar scripts/lib/sonidos.ps1
# Cambiar duraciones (en ms) y frecuencias (en Hz)
Play-SonidoSutil -Frecuencia 1000 -duración 300
```

## 📈 Beneficios

1. **retroalimentación inmediata** sin mirar pantalla
2. **Awareness** de estado del proceso
3. **Productividad** - continua trabajando mientras ejecuta
4. **satisfacción** - sonidos de éxito gratificantes
5. **Alertas** - errores no pasan desapercibidos

## 🎯 Roadmap

Posibles mejoras futuras:

- [ ] Archivos WAV personalizados (mas profesional)
- [ ] configuración de volumen relativo
- [ ] Temas de sonidos (clásico, moderno, cyberpunk)
- [ ] Sonidos para GitHub Actions (notificaciones)
- [ ] integración con notificaciones de Windows
- [ ] Soporte para macOS/Linux (diferentes APIs)

---

**Desarrollado por**: Mahitek 3D Lab  
**Version**: 1.0.0  
**Fecha**: Octubre 2025


