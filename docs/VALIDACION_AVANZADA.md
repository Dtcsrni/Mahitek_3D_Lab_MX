# 🔒 Sistema de Validación Avanzada

## 📋 Descripción

El sistema de validación avanzada detecta automáticamente errores de integración, vulnerabilidades de seguridad y problemas de integridad de datos antes del deploy.

## 🎯 Scripts de Validación

### 1. `validar-codigo.ps1` - Validación Básica
Valida sintaxis y estructura básica del código.

```powershell
.\scripts\validar-codigo.ps1
.\scripts\validar-codigo.ps1 -Verbose    # Más detalles
.\scripts\validar-codigo.ps1 -SinSonidos # Sin sonidos
```

**Verifica:**
- ✅ JSON válido (syntax)
- ✅ Referencias de archivos (CSS, JS, imágenes)
- ✅ Sintaxis JavaScript (con Node.js si está disponible)
- ✅ Estructura HTML (DOCTYPE, meta tags, etc.)
- ✅ Integridad de datos (productos, promociones)
- ✅ Estado de Git

### 2. `validar-avanzado.ps1` - Validación de Seguridad e Integridad ⭐
**NUEVO** - Detecta problemas que NO detectan otras herramientas.

```powershell
.\scripts\validar-avanzado.ps1
.\scripts\validar-avanzado.ps1 -Verbose  # Más detalles
```

**Verifica:**

#### 🔗 Integridad HTML ↔ JavaScript
- **IDs usados en JS existen en HTML**
  - Detecta: `getElementById('promos')` cuando HTML tiene `id="promociones"`
  - **Este bug causó que las promociones no se cargaran** ✓ DETECTADO
- **Clases CSS manipuladas en JS están definidas en CSS**
  - Detecta: `classList.add('active')` sin `.active {}` en CSS

#### 🛡️ Seguridad XSS y Vulnerabilidades
- **innerHTML sin sanitización** ⚠️ CRÍTICO
  - Detecta: `element.innerHTML = userInput` (riesgo XSS)
  - Requiere: `escapeHTML()` o `DOMPurify.sanitize()`
- **eval() detectado** 🔴 RIESGO CRÍTICO
  - Ejecución de código arbitrario
- **new Function() detectado** 🔴 RIESGO
  - Similar a `eval()`
- **document.write()** ⚠️ Mala práctica
  - Recomienda: `createElement()` + `appendChild()`
- **console.log sin protección DEBUG_MODE** ⚠️
  - Detecta consoles expuestos en producción
- **Función escapeHTML() presente**
  - Verifica que existe para sanitización
- **Content Security Policy (CSP)**
  - Verifica meta tag CSP en HTML
- **Headers de seguridad**
  - X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

#### 📊 Integridad de Datos JSON
- **Campos requeridos** (id, titulo, nombre, etc.)
- **Validación de fechas** (desde < hasta)
- **Formato de fechas válido**
- **Iconos/imágenes existen** (si referencian assets/)

## 📈 Resultados Actuales

Última ejecución (26/10/2025):

```
✅ Pasadas: 9
⚠️  Advertencias: 1
✗  Errores: 5

ERRORES DETECTADOS:
1. ID 'faq-schema' usado en JS pero NO existe en HTML
2. innerHTML sin sanitizar en displayedProducts
3. innerHTML sin sanitizar en activePromos
4. innerHTML sin sanitizar en faqData
5. innerHTML sin sanitizar en featured

ADVERTENCIAS:
1. 9 console.log sin protección DEBUG_MODE
```

## 🔧 Uso Recomendado

### Pre-commit Hook (Manual)
```powershell
# Antes de cada commit
.\scripts\validar-codigo.ps1
.\scripts\validar-avanzado.ps1
```

### En CI/CD (GitHub Actions)
```yaml
- name: Validar código básico
  run: ./scripts/validar-codigo.ps1
  
- name: Validar seguridad avanzada
  run: ./scripts/validar-avanzado.ps1
  continue-on-error: true  # Opcional: solo advertir
```

## 🎓 Ejemplos de Problemas Detectados

### Ejemplo 1: Mismatch de IDs (Bug Real Detectado ✓)
```html
<!-- index.html -->
<section id="promos">
```

```javascript
// app.js
const section = document.getElementById('promociones'); // ❌ NO EXISTE
```

**Detección:**
```
[✗] ID 'promociones' usado en JS pero NO existe en HTML
[ℹ]   Revisar getElementById('promociones') o querySelector('#promociones')
```

**Solución:**
```javascript
const section = document.getElementById('promos'); // ✅ CORRECTO
```

### Ejemplo 2: innerHTML sin Sanitización
```javascript
// ❌ INSEGURO - Riesgo XSS
element.innerHTML = userInput;

// ✅ SEGURO - Con sanitización
element.innerHTML = escapeHTML(userInput);
```

**Detección:**
```
[✗] innerHTML sin sanitizar: userInput
[ℹ]   Riesgo XSS - usar escapeHTML
```

### Ejemplo 3: console.log en Producción
```javascript
// ❌ EXPUESTO en producción
console.log('Debug info:', data);

// ✅ PROTEGIDO - Solo en development
if (CONFIG.DEBUG_MODE) {
    console.log('Debug info:', data);
}
```

**Detección:**
```
[⚠] 9 console.log sin protección DEBUG_MODE
[ℹ]   Recomendación: Envolver en if CONFIG.DEBUG_MODE
```

## 📊 Niveles de Severidad

| Icono | Nivel | Descripción |
|-------|-------|-------------|
| 🔴 | CRÍTICO | Vulnerabilidad de seguridad grave (eval, innerHTML sin sanitizar) |
| ✗ | ERROR | Código roto o bug funcional (IDs faltantes, fechas inválidas) |
| ⚠️ | ADVERTENCIA | Mala práctica o potencial problema (console.log, document.write) |
| ✅ | OK | Verificación pasada correctamente |

## 🚀 Próximas Mejoras

- [ ] Detectar API keys expuestas en código
- [ ] Validar localStorage para datos sensibles
- [ ] Verificar HTTPS en URLs de APIs
- [ ] Detectar loops anidados (O(n²))
- [ ] Validar lazy loading de imágenes
- [ ] Verificar alt text en imágenes (A11y)
- [ ] Verificar aria-label en botones
- [ ] Integración con pre-commit hooks automáticos

## 📚 Referencias

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web.dev Security](https://web.dev/secure/)

---

**Autor:** Sistema de Validación Mahitek 3D Lab  
**Última actualización:** 26 de octubre de 2025
