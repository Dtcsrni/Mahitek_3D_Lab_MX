# 🔒 Sistema de Validación Integral - Mahitek 3D Lab

## 📋 Descripción

Sistema unificado de validación que combina validaciones de sintaxis, integridad, seguridad y mejores prácticas en una sola herramienta altamente confiable.

**Versión 2.0 - Sistema Unificado**

## 🚀 Uso Rápido

```powershell
# Validación completa (recomendado antes de commit)
.\scripts\validar-todo.ps1

# Modo rápido (solo validaciones críticas - ~0.06s)
.\scripts\validar-todo.ps1 -QuickCheck

# Solo seguridad
.\scripts\validar-todo.ps1 -SecurityOnly

# Con detalles verbosos
.\scripts\validar-todo.ps1 -Verbose

# Sin sonidos
.\scripts\validar-todo.ps1 -SinSonidos
```

## 📊 Módulos de Validación

### 🔹 Módulo 1: Sintaxis y Estructura

- ✅ JSON válido (syntax check)
- ✅ JavaScript syntax (Node.js si disponible, fallback a validación básica)
- ✅ Estructura HTML (DOCTYPE, meta tags, Open Graph)
- ✅ Referencias de archivos (CSS, JS, imágenes)

### 🔹 Módulo 2: Integridad HTML ↔ JavaScript

- ✅ **IDs usados en JS existen en HTML** ⭐
  - Detecta: `getElementById('promos')` cuando HTML tiene `id="promociones"`
  - **Previene el bug de promociones que se encontró**
- ✅ Clases CSS manipuladas en JS están definidas
  - Detecta: `classList.add('active')` sin `.active {}` en CSS

### 🔹 Módulo 3: Seguridad

- 🔴 **innerHTML sin sanitización** (CRÍTICO)
- 🔴 **eval() detectado** (CRÍTICO)
- 🔴 **new Function() detectado** (CRÍTICO)
- ⚠️ **document.write()** (Mala práctica)
- ⚠️ **console.log sin protección DEBUG_MODE**
- ✅ Función escapeHTML() presente
- ✅ Content Security Policy (CSP)
- ✅ Headers de seguridad (\_headers)

### 🔹 Módulo 4: Integridad de Datos

- ✅ Campos requeridos en JSON (id, titulo, nombre)
- ✅ Validación de fechas (desde < hasta)
- ✅ Formato de fechas válido
- ✅ Iconos/imágenes existen (si referencian assets/)

### 🔹 Módulo 5: Estado de Git

- ℹ️ Archivos modificados
- ℹ️ Working directory status

## 📈 Resultados de Ejemplo

```
╔══════════════════════════════════════════════════════════════╗
║  📊 RESUMEN DE VALIDACIÓN                                   ║
╚══════════════════════════════════════════════════════════════╝

  Tests ejecutados: 55
  ✅ Pasados: 49
  ⚠️  Advertencias: 1
  ✗  Errores: 5
  🔴 CRÍTICOS: 4

  ⏱️  Tiempo de ejecución: 2 segundos
```

## 🎯 Códigos de Salida

| Código | Estado     | Descripción                                          |
| ------ | ---------- | ---------------------------------------------------- |
| 0      | ✅ EXITOSO | Todas las validaciones pasaron (warnings permitidos) |
| 1      | ⚠️ ERRORES | Errores encontrados - revisar antes de commit        |
| 2      | 🔴 CRÍTICO | Errores críticos de seguridad - **ACCIÓN REQUERIDA** |

## 🔥 Modos de Ejecución

### Modo Completo (Defecto)

Ejecuta todos los módulos (8 módulos, ~2 segundos)

```powershell
.\scripts\validar-todo.ps1
```

**Incluye:**

- Sintaxis JSON + JavaScript
- Estructura HTML
- Referencias de archivos
- Integridad HTML ↔ JS
- Seguridad completa
- Integridad de datos
- Estado de Git

### Modo Rápido (`-QuickCheck`)

Solo validaciones críticas (~0.06 segundos)

```powershell
.\scripts\validar-todo.ps1 -QuickCheck
```

**Incluye:**

- Sintaxis JSON + JavaScript
- Integridad HTML ↔ JS (detecta IDs faltantes)

**Ideal para:** Pre-commit hooks, validación rápida durante desarrollo

### Modo Seguridad (`-SecurityOnly`)

Solo validaciones de seguridad

```powershell
.\scripts\validar-todo.ps1 -SecurityOnly
```

**Incluye:**

- innerHTML sin sanitizar (XSS)
- eval() y new Function()
- document.write()
- console.log expuestos
- CSP y headers de seguridad

**Ideal para:** Auditorías de seguridad, antes de deploy

## 🎓 Ejemplos de Bugs Detectados

### 1. ID Faltante en HTML (Bug Real ✓)

```javascript
// assets/js/app.js
const section = document.getElementById('promociones'); // ❌
```

```html
<!-- index.html -->
<section id="promos"><!-- ✗ NO COINCIDE --></section>
```

**Detección:**

```
[✗] ID 'promociones' usado en JS pero NO existe en HTML
    Revisar getElementById('promociones') o querySelector('#promociones')
```

**Solución:**

```javascript
const section = document.getElementById('promos'); // ✅
```

### 2. innerHTML sin Sanitización (CRÍTICO)

```javascript
// ❌ INSEGURO
container.innerHTML = products.map(p => `<div>${p.name}</div>`).join('');
```

**Detección:**

```
[🔴 CRÍTICO] innerHTML sin sanitizar detectado
    Código: products.map(p => `<div>${p.name}</div>`)... | Riesgo: XSS
```

**Solución:**

```javascript
// ✅ SEGURO
container.innerHTML = products.map(p => `<div>${escapeHTML(p.name)}</div>`).join('');
```

### 3. console.log en Producción

```javascript
// ❌ EXPUESTO
console.log('User data:', userData);
```

**Detección:**

```
[⚠] 9 console.log sin protección DEBUG_MODE
    Expuestos en producción
```

**Solución:**

```javascript
// ✅ PROTEGIDO
if (CONFIG.DEBUG_MODE) {
  console.log('User data:', userData);
}
```

## 📊 Niveles de Severidad

| Símbolo | Nivel           | Acción                                                   |
| ------- | --------------- | -------------------------------------------------------- |
| 🔴      | **CRÍTICO**     | Acción inmediata requerida - Vulnerabilidad de seguridad |
| ✗       | **ERROR**       | Código roto - Corregir antes de commit                   |
| ⚠️      | **ADVERTENCIA** | Mala práctica - Revisar y mejorar                        |
| ✅      | **OK**          | Validación pasada correctamente                          |
| ℹ️      | **INFO**        | Información adicional                                    |

## 🔧 Integración en Workflow

### Pre-commit Hook

```powershell
# .git/hooks/pre-commit
.\scripts\validar-todo.ps1 -QuickCheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "Validación fallida - commit cancelado" -ForegroundColor Red
    exit 1
}
```

### CI/CD (GitHub Actions)

```yaml
- name: Validación Integral
  run: |
    pwsh ./scripts/validar-todo.ps1
  continue-on-error: false
```

### Durante Desarrollo

```powershell
# Validación rápida mientras trabajas
.\scripts\validar-todo.ps1 -QuickCheck

# Validación completa antes de commit
.\scripts\validar-todo.ps1

# Solo seguridad antes de deploy
.\scripts\validar-todo.ps1 -SecurityOnly
```

## 📦 Comparación con Scripts Anteriores

| Feature               | validar-codigo.ps1 | validar-avanzado.ps1 | **validar-todo.ps1** ⭐ |
| --------------------- | ------------------ | -------------------- | ----------------------- |
| Sintaxis JSON         | ✅                 | ❌                   | ✅                      |
| Sintaxis JS           | ✅                 | ❌                   | ✅                      |
| HTML Structure        | ✅                 | ❌                   | ✅                      |
| **HTML ↔ JS IDs**    | ❌                 | ✅                   | ✅                      |
| **Seguridad XSS**     | ❌                 | ✅                   | ✅                      |
| Integridad Datos      | ✅                 | ✅                   | ✅                      |
| Modo Rápido           | ❌                 | ❌                   | ✅                      |
| Modo Seguridad        | ❌                 | ✅                   | ✅                      |
| Tracking Detallado    | ❌                 | ❌                   | ✅                      |
| Códigos de Salida     | ✅                 | ✅                   | ✅                      |
| Sonidos               | ✅                 | ❌                   | ✅                      |
| **Tiempo (completo)** | ~3s                | ~1s                  | **~2s**                 |
| **Tiempo (rápido)**   | N/A                | N/A                  | **~0.06s**              |

## 🚀 Ventajas del Sistema Unificado

### ✅ Consolidación

- **1 script** en lugar de 2
- Configuración centralizada
- Mantenimiento simplificado

### ✅ Modos Flexibles

- **Modo Completo**: Validación exhaustiva
- **Modo Rápido**: Pre-commit hook (~0.06s)
- **Modo Seguridad**: Auditorías de seguridad

### ✅ Tracking Avanzado

- Contadores globales de tests
- Clasificación por severidad (CRÍTICO, ERROR, WARN, OK)
- Tiempo de ejecución medido

### ✅ Salidas Claras

- Exit codes diferenciados (0/1/2)
- Resumen estructurado
- Detalles contextuales

### ✅ Experiencia de Usuario

- Sonidos configurables
- Output colorizado
- Modo verbose disponible

## 📚 Historial de Bugs Detectados

### Bug #1: Promociones no se cargaban (26/10/2025)

**Síntoma:** Placeholder mostrado en lugar de 31 promociones activas

**Causa:**

```javascript
const section = document.getElementById('promociones'); // NO EXISTE
```

```html
<section id="promos"><!-- ID DIFERENTE --></section>
```

**Detección:** `validar-todo.ps1` ahora detecta este error automáticamente

**Fix:** Commit `fadab9a` - Cambiar `'promociones'` → `'promos'`

**Prevención:** Ejecutar `.\scripts\validar-todo.ps1` antes de cada commit

## 🎯 Próximas Mejoras

- [ ] API keys expuestas en código
- [ ] localStorage para datos sensibles
- [ ] HTTPS en URLs de APIs
- [ ] Loops anidados (O(n²))
- [ ] Lazy loading de imágenes
- [ ] Alt text en imágenes (A11y)
- [ ] ARIA labels en botones
- [ ] Pre-commit hook automático
- [ ] Integración con VS Code (extensión)

## 🤝 Contribuciones

Para agregar nuevas validaciones:

1. Crear función `Test-NombreValidacion` en el módulo correspondiente
2. Usar `Test-Pass`, `Test-Fail`, `Test-Warn`, `Test-Critical` para tracking
3. Agregar al flujo principal en sección "EJECUCIÓN PRINCIPAL"
4. Documentar en este README

## 📄 Licencia

Sistema de Validación Integral - Mahitek 3D Lab  
Versión 2.0 - Sistema Unificado

---

**Última actualización:** 26 de octubre de 2025  
**Mantenedor:** Mahitek 3D Lab DevOps Team
