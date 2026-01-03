# 🧪 Sistema de Pruebas y Commits Automatizados
<!-- cspell:ignore Validacion condicion -->

Sistema profesional de validación de código y commits automatizados para Mahitek 3D Lab.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Scripts Disponibles](#scripts-disponibles)
- [Validaciones Implementadas](#validaciones-implementadas)
- [Conventional Commits](#conventional-commits)
- [FAQ](#faq)

---

## ✨ Características

- ✅ **Validación automática** de HTML, CSS, JavaScript y JSON
- ✅ **Verificación de rutas** de imágenes, estilos y scripts
- ✅ **Git hooks** para validar antes de cada commit
- ✅ **Commits automatizados** con mensajes profesionales
- ✅ **Conventional Commits** para historial limpio
- ✅ **Reportes detallados** con errores, warnings y éxitos

---

## 🚀 Instalación

### 1. Instalar Git Hooks (Una sola vez)

```powershell
# Desde la raíz del proyecto
.\scripts\instalar-hooks.ps1
```

Esto configurará:
- **pre-commit**: Valida código antes de cada commit
- **commit-msg**: Valida formato de mensajes de commit

### 2. Verificar Instalación

```powershell
# Los hooks deben existir en:
ls .git/hooks/
# → pre-commit
# → commit-msg
```

---

## 📖 Uso

### Opción 1: Commit Manual (con validación automática)

```powershell
# Hacer cambios en el código...

# Git ejecutará automáticamente las validaciones
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

**Si las validaciones fallan**, el commit será rechazado:
```
❌ Commit rechazado: Las validaciones fallaron
   Corrige los errores o usa 'git commit --no-verify' para omitir
```

### Opción 2: Commit Automatizado (Recomendado)

```powershell
# Commit con mensaje automático
.\scripts\commit-auto.ps1

# Commit con mensaje personalizado
.\scripts\commit-auto.ps1 -Mensaje "agregar sistema de pruebas"

# Commit de tipo específico
.\scripts\commit-auto.ps1 -Tipo fix -Mensaje "corregir error en validación"

# Sin hacer push (solo commit local)
.\scripts\commit-auto.ps1 -NoPush

# Omitir validaciones (no recomendado)
.\scripts\commit-auto.ps1 -SkipTests
```

### Opción 3: Solo Validar (sin commit)

```powershell
# Ejecutar validaciones manualmente
.\scripts\validar-codigo.ps1

# Con output detallado
.\scripts\validar-codigo.ps1 -Verbose
```

---

## 📜 Scripts Disponibles

### `validar-codigo.ps1`

Ejecuta todas las validaciones de código.

```powershell
# Sintaxis
.\scripts\validar-codigo.ps1 [-Verbose]

# Ejemplos
.\scripts\validar-codigo.ps1                # Validación normal
.\scripts\validar-codigo.ps1 -Verbose       # Con detalles
```

**Validaciones incluidas**:
- ✅ Sintaxis JSON válida
- ✅ Referencias de archivos existen
- ✅ Sintaxis JavaScript básica
- ✅ Estructura HTML correcta
- ✅ Integridad de datos (productos, promos)
- ✅ Estado de Git

**Salida de ejemplo**:
```
=== Validando archivos JSON ===
✅ JSON válido: products.json
✅ JSON válido: promos.json

=== Resumen de Validación ===
✅ Pruebas pasadas: 15
⚠️  Advertencias: 2
❌ Errores: 0

╔════════════════════════════════════════╗
║  ✅ VALIDACIÓN EXITOSA - OK PARA COMMIT  ║
╚════════════════════════════════════════╝
```

---

### `commit-auto.ps1`

Sistema de commit automatizado con validaciones integradas.

```powershell
# Sintaxis
.\scripts\commit-auto.ps1 [-Mensaje <texto>] [-Tipo <tipo>] [-NoPush] [-SkipTests] [-Verbose]

# Ejemplos
.\scripts\commit-auto.ps1                                           # Mensaje automático
.\scripts\commit-auto.ps1 -Mensaje "agregar carousel"               # Mensaje custom
.\scripts\commit-auto.ps1 -Tipo fix -Mensaje "corregir bug"         # Tipo específico
.\scripts\commit-auto.ps1 -NoPush                                   # Sin push
.\scripts\commit-auto.ps1 -SkipTests                                # Sin validaciones
```

**Parámetros**:
- `-Mensaje`: Descripción del commit (opcional, se genera automático)
- `-Tipo`: Tipo de commit (feat, fix, docs, style, refactor, perf, test, chore)
- `-NoPush`: No hacer push automático a GitHub
- `-SkipTests`: Omitir validaciones (no recomendado)
- `-Verbose`: Output detallado

**Flujo del script**:
1. ✅ Verifica cambios en Git
2. ✅ Ejecuta validaciones (si no se omiten)
3. ✅ Genera mensaje profesional
4. ✅ Pide confirmación al usuario
5. ✅ Hace commit
6. ✅ Hace push (si se confirma)

---

### `instalar-hooks.ps1`

Instala Git hooks de validación automática.

```powershell
# Ejecutar una sola vez
.\scripts\instalar-hooks.ps1
```

**Hooks instalados**:
- **pre-commit**: Ejecuta `validar-codigo.ps1` antes de cada commit
- **commit-msg**: Valida formato Conventional Commits

---

## 🔍 Validaciones Implementadas

### 1. Validación JSON
- ✅ Sintaxis válida en todos los archivos `.json`
- ✅ Archivos: `data/*.json`, `assets/data/*.json`

### 2. Referencias de Archivos
- ✅ Todas las imágenes en `src=""` existen
- ✅ Todos los archivos CSS en `href=""` existen
- ✅ Todos los archivos JS en `src=""` existen

### 3. Sintaxis JavaScript
- ✅ Paréntesis balanceados: `( )`
- ✅ Llaves balanceadas: `{ }`
- ✅ Corchetes balanceados: `[ ]`
- ⚠️  Detecta `console.log` sin verificación `DEBUG_MODE`

### 4. Estructura HTML
- ✅ DOCTYPE presente
- ✅ Tags requeridos: `<html>`, `<head>`, `<body>`, `<title>`
- ✅ Meta tag UTF-8
- ✅ Meta tag viewport
- ✅ Idioma configurado (`lang="es-MX"`)
- ✅ Open Graph tags presentes

### 5. Integridad de Datos
- ✅ Productos con campos requeridos (nombre, precio)
- ✅ Promociones válidas
- ✅ Conteo de items activos vs totales

### 6. Estado de Git
- ℹ️  Muestra archivos modificados
- ℹ️  Verifica working directory

---

## 📝 Conventional Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) para mensajes de commit claros y consistentes.

### Formato

```
<tipo>(alcance opcional): <descripción>

[cuerpo opcional]

[pie opcional]
```

### Tipos Permitidos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat: agregar sistema de localización` |
| `fix` | Corrección de bug | `fix: corregir error en carousel` |
| `docs` | Cambios en documentación | `docs: actualizar README` |
| `style` | Cambios de formato (CSS, espacios) | `style: ajustar responsive mobile` |
| `refactor` | Refactorización de código | `refactor: optimizar función cargarProductos` |
| `perf` | Mejora de rendimiento | `perf: lazy load de imágenes` |
| `test` | Agregar o modificar tests | `test: agregar validación de JSON` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |

### Ejemplos

```bash
# Feature nueva
git commit -m "feat: agregar carrusel de productos"

# Fix con alcance
git commit -m "fix(css): corregir alineación en mobile"

# Docs
git commit -m "docs: agregar guía de instalación"

# Multiple líneas
git commit -m "feat: sistema de pruebas automatizado

- Agregar validación de código
- Implementar Git hooks
- Crear script de commit automatizado"
```

---

## 🛠️ Personalización

### Agregar Nueva Validación

Edita `scripts/validar-codigo.ps1`:

```powershell
function Test-NuevaValidacion {
    Write-Header "Validando nueva característica"
    
    # Tu lógica de validación aquí
    if ($condicion) {
        Write-Success "Validación pasada"
        $script:TotalPasados++
    }
    else {
        Write-Error-Custom "Validación fallida"
        $script:TotalErrores++
    }
}

# Agregar al flujo principal
Test-NuevaValidacion
```

### Modificar Tipos de Commit

Edita `scripts/commit-auto.ps1`:

```powershell
[ValidateSet("feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "mi-tipo")]
[string]$Tipo = "feat",
```

---

## ❓ FAQ

### ¿Cómo omitir las validaciones?

```powershell
# Opción 1: Con flag --no-verify
git commit -m "mensaje" --no-verify

# Opción 2: Con script automatizado
.\scripts\commit-auto.ps1 -SkipTests
```

⚠️ **No recomendado**: Solo usar en casos excepcionales.

### ¿Qué pasa si las validaciones fallan?

El commit será rechazado automáticamente. Debes:
1. Revisar los errores mostrados
2. Corregir los problemas
3. Intentar el commit nuevamente

### ¿Puedo usar esto en Linux/Mac?

Los scripts están hechos en PowerShell (`.ps1`) para Windows. Para Linux/Mac:
1. Instala [PowerShell Core](https://github.com/PowerShell/PowerShell)
2. O convierte los scripts a Bash (`.sh`)

### ¿Los hooks funcionan en todos los clientes Git?

Sí, los Git hooks son estándar y funcionan con:
- ✅ Git Bash
- ✅ Git CLI
- ✅ VS Code (Source Control)
- ✅ GitHub Desktop
- ✅ GitKraken
- ✅ Otros clientes que respeten hooks

### ¿Cómo desinstalar los hooks?

```powershell
# Eliminar hooks
Remove-Item .git/hooks/pre-commit
Remove-Item .git/hooks/commit-msg
```

---

## 📊 Estadísticas

Validaciones implementadas: **6 categorías**
- JSON Files: ~5 archivos
- File References: ~30 validaciones
- JavaScript Syntax: ~3 archivos
- HTML Structure: ~10 validaciones
- Data Integrity: ~2 archivos
- Git Status: 1 verificación

**Total: ~50+ validaciones automáticas** 🎯

---

## 🤝 Contribuir

Para agregar nuevas validaciones o mejorar el sistema:

1. Edita los scripts en `scripts/`
2. Prueba con `.\scripts\validar-codigo.ps1 -Verbose`
3. Commit con `.\scripts\commit-auto.ps1`
4. Envía PR con descripción clara

---

## 📄 Licencia

Este sistema de pruebas es parte de Mahitek 3D Lab y está bajo la misma licencia del proyecto principal.

---

## 🙏 Créditos

- **Desarrollado por**: Mahitek 3D Lab
- **Basado en**: Conventional Commits, Git Hooks, PowerShell
- **Versión**: 1.0.0
- **Fecha**: Octubre 2025

---

**¿Necesitas ayuda?** Revisa la [documentación principal](../README.md) o abre un issue en GitHub.


