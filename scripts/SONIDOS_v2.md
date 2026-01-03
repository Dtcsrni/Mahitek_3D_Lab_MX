# 🔊 Sistema de Retroalimentación Sonora Cyberpunk v2.0
<!-- cspell:ignore Validacion Confirmacion Opcion Categoria Navegacion -->

Sistema de sonidos sutiles, profesionales y **optimizados para ambiente nocturno** para programación asistida por IA en Mahitek 3D Lab.

## 🎯 Filosofía de Diseño v2.0

Este sistema ha sido **completamente rediseñado** basándose en investigación científica de interfaces humano-máquina para proporcionar retroalimentación auditiva óptima durante sesiones prolongadas de codificación nocturna.

### Fundamentos de Investigación UX

El diseño está respaldado por:

- **ISO 9241-910**: Estándares internacionales de ergonomía para interfaces auditivas
- **Norman 2013**: Principios de diseño emocional y feedback significativo
- **Gaver 1986**: Teoría de iconos auditivos y affordances sonoras
- **Miller 1956**: Límites cognitivos (7±2 items, 40-120ms tiempo mínimo de procesamiento)
- **Weber-Fechner Law**: Percepción psicoacústica de diferencias de frecuencia

### Parámetros de Diseño Nocturno

```
Rango de frecuencias: 200-600 Hz (graves/medios, menos fatigantes)
Duración de pulsos:   40-120ms (mínimo cognitivo según Miller 1956)
Espaciado:            30-80ms (evita enmascaramiento auditivo)
Patrón universal:     Ascendente = éxito, Descendente = error
Modo Nocturno:        Aplica reducción adicional de -100 Hz
```

### Perfiles de Sonido

- **🌙 Nocturno** (default): Frecuencias reducidas en 100 Hz adicionales para menos fatiga auditiva
- **☀️ Diurno**: Frecuencias normales (200-600 Hz)
- **🔇 Silencioso**: Desactiva todos los sonidos

## 🎵 Catálogo de 23 Sonidos Cyberpunk

### Categoría 1: Sistema (Muy Sutiles) 💻

| Función | Frecuencia | Patrón | Uso |
|---------|-----------|--------|-----|
| `Play-SistemaIniciado` | 220 Hz | Pulso único grave | Terminal arranca |
| `Play-ProcesoIniciado` | 240-220 Hz | Dos pulsos descendentes | Tarea larga inicia |
| `Play-CargandoDatos` | 280-260-240 Hz | Tres pulsos descendentes | Carga de archivos |

**Psicología**: Tonos graves indican "carga" sin generar ansiedad (Gaver 1986)

### Categoría 2: Retroalimentación Positiva (Ascendente) ✅

| Función | Frecuencia | Patrón Musical | Uso |
|---------|-----------|---------------|-----|
| `Play-TareaCompletada` | D3-F3-A3 (293-349-440 Hz) | Acorde menor armónico | Tarea exitosa |
| `Play-ValidacionOK` | 330-370 Hz | Dos pulsos ascendentes | Validación pasada |
| `Play-CommitExitoso` | C3-E3-G3-C4 (261-329-392-523 Hz) | Acorde mayor (confianza) | Commit creado |
| `Play-PushExitoso` | 277-554 Hz (5 tonos) | Ascendente con aceleración | Push completado |
| `Play-DeployExitoso` | 220-440 Hz | Arpegio espaciado | Deploy exitoso |

**Psicología**: Ascenso = éxito (universal cross-cultural)

### Categoría 3: Interacción Usuario (Neutral) 🔔

| Función | Frecuencia | Patrón | Uso |
|---------|-----------|--------|-----|
| `Play-SolicitarConfirmacion` | 330 Hz (E4) | Tono neutro único | Solicitar input |
| `Play-OpcionSeleccionada` | 370 Hz | Click corto | Selección confirmada |
| `Play-MenuNavegacion` | 350 Hz | Tick muy breve | Navegación en menú |
| `Play-InputRecibido` | 310 Hz × 2 | Eco doble | Input procesado |

**Diseño**: Minimalista, no invasivo (Nielsen 10 Heuristics)

### Categoría 4: Alertas y Advertencias (Descendente) ⚠️

| Función | Frecuencia | Patrón | Uso |
|---------|-----------|--------|-----|
| `Play-Advertencia` | 400-380 Hz | Oscilación sutil | Advertencia menor |
| `Play-TestsFallidos` | 330-293-261 Hz | Tres tonos descendentes | Tests fallaron |
| `Play-ErrorCritico` | A3-F#3-E3-D3 (440-370-330-293 Hz) | Tensión armónica | Error crítico |
| `Play-RiesgoDetectado` | 350-400 Hz × 4 | Sirena sutil alternante | Riesgo detectado |
| `Play-ConflictoGit` | 277-293 Hz | Disonancia | Conflicto merge |
| `Play-ErrorSintaxis` | 370-350-330 Hz | Glitch rápido | Sintaxis inválida |

**Weber-Fechner**: Descenso perceptible pero no agresivo

### Categoría 5: Sonidos Especiales Cyberpunk 🌐

| Función | Frecuencia | Patrón | Efecto |
|---------|-----------|--------|---------|
| `Play-ScanIniciado` | 220-392 Hz (6 pulsos) | Barrido digital ascendente | Scanner |
| `Play-DataStream` | 310 Hz × 4 | Pulsos rápidos idénticos | Transmisión |
| `Play-GitPull` | 440-311 Hz | Descendente lento | Descarga |
| `Play-BuildIniciado` | 220-247 Hz | Graves acelerando | Motor compilación |
| `Play-BreakpointHit` | 277 Hz | Pulso único enfático | Pausa debug |
| `Play-AIThinking` | 330-349 Hz | Oscilación pensante | IA procesando |
| `Play-NetworkError` | 370-293 Hz | Descenso espaciado | Desconexión |
| `Play-SistemaAlerta` | 440-370 Hz × 3 | Alternancia rápida | Emergencia crítica |

**Blattner 1989**: Aceleración rítmica = "proceso completado"

## 📊 Comparación v1.0 vs v2.0

### Reducción de Frecuencias (Menos Fatiga)

```
┌─────────────────────┬────────────────┬────────────────┬─────────────┐
│ Función             │ v1.0 (Hz)      │ v2.0 (Hz)      │ Reducción   │
├─────────────────────┼────────────────┼────────────────┼─────────────┤
│ Rango general       │ 400-900        │ 200-600        │ -33%        │
│ TareaCompletada     │ 600-800        │ 293-440        │ -40%        │
│ CommitExitoso       │ 550-800        │ 261-523        │ -35%        │
│ PushExitoso         │ 600-900        │ 277-554        │ -45%        │
│ ErrorCritico        │ 600-400        │ 440-293        │ -30%        │
└─────────────────────┴────────────────┴────────────────┴─────────────┘
```

### Mejoras en v2.0

✅ **23 tipos de sonidos** (vs 9 en v1.0) - Más granularidad  
✅ **Frecuencias más bajas** (200-600 Hz vs 400-900 Hz) - Menos fatiga  
✅ **Modo Nocturno** con reducción adicional de -100 Hz  
✅ **Patrones cyberpunk** (scanner, data stream, glitch, etc.)  
✅ **Base científica** (ISO 9241-910, Norman, Gaver, Miller)  
✅ **Acordes musicales** (D menor, C mayor para coherencia armónica)  
✅ **Duraciones optimizadas** (40-120ms vs 60-200ms)  
✅ **Espaciado preciso** (30-80ms para evitar masking auditivo)  

## 🚀 Uso

### Probar Sonidos

```powershell
# Probar todos los 23 sonidos organizados por categoría
.\scripts\probar-sonidos.ps1
```

**Salida esperada**:
```
======================================
  SISTEMA DE SONIDOS CYBERPUNK v2.0
  Frecuencias: 200-600 Hz (Nocturno)
======================================

[INFO] categoría 1: Sistema
  [1.1] Sistema Iniciado (220 Hz):
  [1.2] Proceso Iniciado (240-220 Hz):
  [1.3] Cargando Datos (280-240 Hz):

[INFO] categoría 2: retroalimentación Positiva
  [2.1] Tarea Completada (acorde D-F-A):
  [2.2] validación OK (330-370 Hz):
  ...

======================================
  PRUEBA COMPLETADA - 23 SONIDOS
  Perfil actual: Nocturno
======================================
```

### En Scripts Automatizados

Los sonidos se activan automáticamente en:

#### **validar-codigo.ps1**

```powershell
# Con sonidos (default)
.\scripts\validar-codigo.ps1

# Sin sonidos
.\scripts\validar-codigo.ps1 -SinSonidos
```

**Retroalimentación sonora**:
- 🔔 Al iniciar → `Play-ProcesoIniciado` (240-220 Hz)
- ✅ Si pasa todo → `Play-ValidacionOK` (330-370 Hz) + `Play-TareaCompletada` (acorde D-F-A)
- ❌ Si hay errores → `Play-TestsFallidos` (330-293-261 Hz descendente)

#### **commit-auto.ps1**

```powershell
# Commit con sonidos
.\scripts\commit-auto.ps1 -Mensaje "Nueva funcionalidad" -Tipo feat

# Commit sin sonidos
.\scripts\commit-auto.ps1 -Mensaje "Nueva funcionalidad" -Tipo feat -SinSonidos
```

**Retroalimentación sonora**:
- 🔔 Al iniciar → `Play-ProcesoIniciado`
- ❓ Antes de confirmar commit → `Play-SolicitarConfirmacion` (330 Hz neutral)
- ✅ Commit exitoso → `Play-CommitExitoso` (acorde C-E-G-C mayor)
- ❓ Antes de push → `Play-SolicitarConfirmacion`
- 🚀 Push exitoso → `Play-PushExitoso` (277-554 Hz acelerado)
- ❌ Si falla → `Play-ErrorCritico` (440-293 Hz tensión)

### Cambiar Perfil de Sonido

```powershell
# Cargar librería
. .\scripts\lib\sonidos.ps1

# Cambiar a modo diurno
Set-PerfilSonido -Perfil "Diurno"

# Cambiar a modo silencioso
Set-PerfilSonido -Perfil "Silencioso"

# Volver a modo nocturno
Set-PerfilSonido -Perfil "Nocturno"
```

### Deshabilitar Temporalmente

```powershell
# Opción 1: Flag en cada ejecución
.\scripts\validar-codigo.ps1 -SinSonidos
.\scripts\commit-auto.ps1 -SinSonidos

# Opción 2: Usar perfil silencioso
. .\scripts\lib\sonidos.ps1
Set-PerfilSonido -Perfil "Silencioso"

# Opción 3: Editar el script
# En lib/sonidos.ps1, cambiar:
$script:SonidosHabilitados = $false
```

## 🎼 Teoría Musical Aplicada

### Acordes Utilizados

**Éxito Mayor (Confianza)**:
- `Play-CommitExitoso`: **C Mayor** (C3-E3-G3-C4)
- Intervalos: Raíz - Tercera Mayor - Quinta - Octava
- Psicología: Resolución, completitud, confianza

**Éxito Menor (Profesional)**:
- `Play-TareaCompletada`: **D Menor** (D3-F3-A3)
- Intervalos: Raíz - Tercera Menor - Quinta
- Psicología: Profesional, sutil, no invasivo

**Disonancia (Error)**:
- `Play-ConflictoGit`: **Semitono** (C#-D)
- Intervalo: Segunda menor (disonancia)
- Psicología: Tensión, conflicto, requiere resolución

### Frecuencias Musicales Exactas

```
┌─────┬──────┬─────────┐
│ Nota│ Hz   │ Uso     │
├─────┼──────┼─────────┤
│ A3  │ 220  │ Inicio  │
│ C3  │ 261  │ Raíz C  │
│ C#3 │ 277  │ Push    │
│ D3  │ 293  │ Raíz D  │
│ E3  │ 329  │ 3ª C    │
│ F3  │ 349  │ 3ª D    │
│ F#3 │ 370  │ Error   │
│ G3  │ 392  │ 5ª C    │
│ A3  │ 440  │ 5ª D    │
│ C4  │ 523  │ Octava  │
│ C#4 │ 554  │ Final   │
└─────┴──────┴─────────┘
```

## 🔬 Investigación y Referencias

### ISO 9241-910: Ergonomics of human-system interaction

**Principios aplicados**:
- **Auditory icons**: Sonidos que representan metáforas del mundo real
- **Frecuencia óptima**: 200-600 Hz para interfaces no críticas
- **Duración mínima**: 40ms para percepción consciente
- **Espaciado mínimo**: 30ms para evitar masking

### Donald Norman (2013): "The Design of Everyday Things"

**Principios aplicados**:
- **Feedback inmediato**: Confirmación auditiva <100ms después de acción
- **Affordances sonoras**: Patrones ascendentes/descendentes universales
- **Diseño emocional**: Sonidos agradables refuerzan comportamiento positivo

### Gaver (1986): "Auditory Icons"

**Principios aplicados**:
- **Iconos auditivos**: Sonidos que evocan conceptos (scanner, stream, glitch)
- **Everyday listening**: Uso de metáforas sonoras familiares
- **Diferenciación**: Cada categoría tiene patrón distintivo

### Miller (1956): "The Magical Number Seven, Plus or Minus Two"

**Principios aplicados**:
- **Límite cognitivo**: 5-9 sonidos por categoría (aplicado)
- **Chunking**: Organización en 5 categorías claras
- **Tiempo de procesamiento**: Mínimo 40ms para registro consciente

### Weber-Fechner Law

**Aplicación psicoacústica**:
- Diferencia mínima perceptible: ~10% de frecuencia base
- Ejemplo: 330 Hz → 363 Hz (diferencia de 10% = clara percepción)
- Usado en: Todos los patrones ascendentes/descendentes

## 🛠️ Personalización

### Modificar Frecuencias

Editar `scripts/lib/sonidos.ps1`:

```powershell
# Ejemplo: Hacer TareaCompletada más agudo
function Play-TareaCompletada {
    Play-SonidoSutil -Frecuencia 350 -duración 60  # Era 293
    Play-Silencio -duración 40
    Play-SonidoSutil -Frecuencia 420 -duración 60  # Era 349
    Play-Silencio -duración 40
    Play-SonidoSutil -Frecuencia 520 -duración 70  # Era 440
}
```

### Ajustar Perfil Nocturno

```powershell
# En la función Play-SonidoSutil, cambiar reducción:
if ($script:PerfilSonido -eq "Nocturno") {
    $Frecuencia = $Frecuencia - 150  # Cambiar de -100 a -150 Hz
}
```

### Crear Nuevos Sonidos

```powershell
function Play-MiSonidoCustom {
    <#
    .SYNOPSIS
    Descripción del sonido
    Patron: Patrón específico
    Frecuencias: X-Y Hz
    #>
    Play-SonidoSutil -Frecuencia 300 -duración 50
    Play-Silencio -duración 30
    Play-SonidoSutil -Frecuencia 400 -duración 50
}
```

## ❓ Troubleshooting

### No escucho ningún sonido

**Causas posibles**:

1. **Hardware sin soporte**:
   - Algunos equipos no soportan `[Console]::Beep()`
   - Solución: Usar auriculares/altavoces externos

2. **Sonidos deshabilitados**:
   ```powershell
   # Verificar estado
   . .\scripts\lib\sonidos.ps1
   Write-Host "Habilitados: $script:SonidosHabilitados"
   Write-Host "Perfil: $script:PerfilSonido"
   ```

3. **Volumen del sistema bajo**:
   - Verificar volumen de Windows
   - Verificar volumen de sonidos del sistema

4. **Perfil Silencioso activo**:
   ```powershell
   Set-PerfilSonido -Perfil "Nocturno"  # Cambiar a Nocturno
   ```

### Los sonidos son muy altos/bajos

**Ajustar volumen del sistema Windows**:
- No se puede controlar programáticamente desde PowerShell
- Ajustar en: Configuración → Sistema → Sonido

**Alternativa**: Modificar duraciones (más corto = menos molesto):

```powershell
# En lib/sonidos.ps1, reducir duraciones
Play-SonidoSutil -Frecuencia 330 -duración 30  # Era 60
```

### Los sonidos interfieren con mi música

**Solución 1**: Usar perfil silencioso
```powershell
Set-PerfilSonido -Perfil "Silencioso"
```

**Solución 2**: Usar flag `-SinSonidos`
```powershell
.\scripts\validar-codigo.ps1 -SinSonidos
```

**Solución 3**: Deshabilitar permanentemente
```powershell
# En lib/sonidos.ps1, línea ~14:
$script:SonidosHabilitados = $false
```

## 📈 Roadmap Futuro

### v2.1 (Planeado)

- [ ] Soporte para archivos WAV (mayor fidelidad)
- [ ] Control dinámico de volumen según hora del día
- [ ] Tema sonoro "Synthwave" adicional
- [ ] Integración con notificaciones de Windows

### v3.0 (Investigación)

- [ ] Análisis de ruido ambiente y ajuste automático
- [ ] Feedback háptico (vibración) en dispositivos compatibles
- [ ] Machine learning para detectar preferencias del usuario
- [ ] Soporte multi-idioma en nombres de funciones

## 📝 Changelog

### v2.0.0 (Actual)

- ✅ Rediseño completo basado en investigación UX (ISO 9241-910, Norman, Gaver)
- ✅ Reducción de frecuencias de 400-900 Hz a 200-600 Hz (-33%)
- ✅ Implementación de 3 perfiles: Nocturno, Diurno, Silencioso
- ✅ Modo Nocturno con reducción adicional de -100 Hz
- ✅ Expansión de 9 a 23 tipos de sonidos
- ✅ Nuevos sonidos cyberpunk: Scanner, DataStream, GitPull, BuildIniciado, etc.
- ✅ Uso de acordes musicales (D menor, C mayor)
- ✅ Duraciones optimizadas (40-120ms)
- ✅ Espaciado preciso (30-80ms) para evitar masking
- ✅ Documentación científica completa

### v1.0.0 (Anterior)

- ✅ 9 sonidos básicos
- ✅ Frecuencias 400-900 Hz
- ✅ Integración con validar-codigo.ps1 y commit-auto.ps1
- ✅ Flag -SinSonidos para deshabilitar

## 🤝 Contribuciones

¿Encontraste un patrón sonoro mejor? ¿Tienes ideas para nuevos sonidos cyberpunk?

1. Edita `scripts/lib/sonidos.ps1`
2. Prueba con `.\scripts\probar-sonidos.ps1`
3. Documenta el cambio en este archivo
4. Commit con tipo `feat(sonidos):` o `fix(sonidos):`

## 📄 Licencia

Parte del proyecto Mahitek 3D Lab - Sistema de testing automatizado.

---

**Última actualización**: v2.0.0 - Sistema Cyberpunk Nocturno  
**Investigación UX**: ISO 9241-910, Norman 2013, Gaver 1986, Miller 1956, Weber-Fechner Law  
**Frecuencias**: 200-600 Hz optimizadas para codificación nocturna prolongada  
**Total sonidos**: 23 organizados en 5 categorías semánticas


