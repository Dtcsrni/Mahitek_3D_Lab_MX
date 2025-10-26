# 📦 Sistema de Gestión de Datos - Mahitek 3D Lab

Documentación del sistema de carga, caché y binding de datos JSON para la landing page.

## 🎯 Componentes

### 1. DataManager (`data-manager.js`)

Gestiona la carga, caché y distribución de datos JSON.

#### Características principales

- ✅ **Caché inteligente** con TTL de 5 minutos
- ✅ **Deduplicación** de requests paralelos
- ✅ **Timeout** configurable (10s por defecto)
- ✅ **Fallback** a caché expirado en caso de error de red
- ✅ **Limpieza automática** de caché cada 10 minutos
- ✅ **Sistema de suscripciones** reactivo
- ✅ **Helpers específicos** por tipo de dato

#### API Principal

```javascript
import DataManager from './modules/data-manager.js';

// Cargar datos
const products = await DataManager.loadData('products');
const copy = await DataManager.loadData('copywriting');

// Cargar múltiples en paralelo
const { products, promos, faq } = await DataManager.loadMultiple(['products', 'promos', 'faq']);

// Forzar refresh (ignorar caché)
const fresh = await DataManager.loadData('products', { forceRefresh: true });

// Helpers específicos
const activeProducts = await DataManager.getProducts({
  category: 'Filamento',
  search: 'PLA',
  activeOnly: true
});

const activePromos = await DataManager.getActivePromos();
const featuredFAQ = await DataManager.getFAQ({ featuredOnly: true });
const brand = await DataManager.getBrand();
const social = await DataManager.getSocial();

// Suscribirse a cambios
const unsubscribe = DataManager.subscribe('products', newData => {
  console.log('Productos actualizados:', newData);
});

// Desuscribirse cuando ya no se necesite
unsubscribe();

// Cache management
DataManager.clearCache('products'); // Limpiar solo productos
DataManager.clearCache(); // Limpiar todo
const stats = DataManager.getCacheStats(); // Estadísticas
```

---

### 2. CopywritingBinder (`copywriting-binder.js`)

Enlaza automáticamente textos de `copywriting.json` a elementos del DOM usando atributos declarativos.

#### Uso básico

##### HTML

```html
<!-- Texto simple -->
<h1 data-copy="hero.title">Cargando...</h1>
<p data-copy="hero.subtitle">Cargando...</p>

<!-- Con variables (interpolación) -->
<p data-copy="products.count" data-copy-vars='{"count": 42}'>Cargando...</p>

<!-- Atributos (placeholder, aria-label, etc.) -->
<input
  type="text"
  data-copy-attr="search.placeholder"
  data-copy-attr-name="placeholder"
  placeholder="Buscar..."
/>

<!-- Modo HTML (solo para copy confiable) -->
<div data-copy="footer.legal" data-copy-mode="html">Cargando...</div>
```

##### JavaScript

```javascript
import CopyBinder from './modules/copywriting-binder.js';

// Enlazar todo el documento
await CopyBinder.bindCopywriting();

// Enlazar un contenedor específico
const container = document.getElementById('hero');
await CopyBinder.bindCopywriting(container);

// Re-enlazar (útil para contenido dinámico)
await CopyBinder.rebindCopywriting(container);

// Obtener texto directamente
const title = await CopyBinder.getCopy('hero.title');
const welcome = await CopyBinder.getCopy('hero.welcome', {
  name: 'Usuario'
});
```

#### Estructura de copywriting.json

```json
{
  "hero": {
    "title": "Mahitek 3D Lab",
    "subtitle": "Impresión 3D profesional en México",
    "cta": "Explorar catálogo"
  },
  "products": {
    "count": "Tenemos {count} productos",
    "empty": "No hay productos disponibles"
  },
  "search": {
    "placeholder": "Buscar productos...",
    "noResults": "Sin resultados para '{query}'"
  }
}
```

---

## 🚀 Inicialización

El sistema se inicializa automáticamente en `boot.js`:

```javascript
// boot.js
import DataManager from './modules/data-manager.js';
import CopyBinder from './modules/copywriting-binder.js';

DataManager.init();

// Precarga de datos críticos (no bloqueante)
DataManager.preloadCritical();

// Enlazar copywriting
CopyBinder.bindCopywriting();
```

---

## 📊 Endpoints disponibles

| Tipo          | Endpoint                 | Helper                 |
| ------------- | ------------------------ | ---------------------- |
| `copywriting` | `data/copywriting.json`  | `getCopywriting(key)`  |
| `products`    | `data/products.json`     | `getProducts(filters)` |
| `promos`      | `data/promos.json`       | `getActivePromos()`    |
| `faq`         | `data/faq.json`          | `getFAQ(options)`      |
| `social`      | `data/social.json`       | `getSocial()`          |
| `brand`       | `assets/data/brand.json` | `getBrand()`           |

---

## 🔒 Seguridad

### Escapado automático

- **CopywritingBinder**: Por defecto usa `textContent` (modo `text`).
- **Modo HTML**: Solo usar con contenido confiable. El copy se inserta con `innerHTML` pero **solo** de archivos JSON internos.
- **Variables**: Todas las interpolaciones pasan por `escapeHTML()`.

### Sanitización en app.js

- **URLs**: Todos los `href` y `src` dinámicos pasan por `sanitizeURL()`.
- **Categorías**: Select poblado con `createElement()` + `textContent`.
- **innerHTML**: Comentarios `// SECURITY: validado manualmente` en templates con `.map()`.

---

## 🎨 Ejemplos prácticos

### Actualizar hero dinámicamente

```javascript
// HTML
<section class="hero">
  <h1 data-copy="hero.title">Cargando...</h1>
  <p data-copy="hero.subtitle">Cargando...</p>
  <button data-copy="hero.cta">Cargando...</button>
</section>;

// JS (boot.js ya lo hace automáticamente)
await CopyBinder.bindCopywriting();
```

### Productos con filtros

```javascript
// Obtener solo productos de Filamento activos
const filaments = await DataManager.getProducts({
  category: 'Filamento',
  activeOnly: true
});

// Buscar productos
const results = await DataManager.getProducts({
  search: 'PLA'
});

console.log(results); // [{ id: 'FIL-001', nombre: 'PLA Blanco', ... }]
```

### Promociones activas por fecha

```javascript
// Automáticamente filtra por rango de fechas
const activePromos = await DataManager.getActivePromos();

// Solo promociones destacadas activas
const featured = activePromos.filter(p => p.destacado);
```

### Suscribirse a cambios

```javascript
// Reaccionar cuando se actualicen productos
DataManager.subscribe('products', products => {
  renderProducts(products);
});

// Forzar recarga y notificar suscriptores
await DataManager.loadData('products', { forceRefresh: true });
```

---

## 📈 Performance

### Estrategia de carga

1. **Precarga crítica** (boot.js):
   - `copywriting`, `products`, `brand`, `social`
   - Carga en paralelo, no bloqueante

2. **Lazy load** (app.js legacy):
   - `promos`: cuando la sección sea visible (IntersectionObserver)
   - `faq`: cuando la sección sea visible

3. **Cache**:
   - TTL: 5 minutos
   - Fallback a caché expirado en error de red
   - Limpieza automática cada 10 minutos

### Métricas esperadas

- **Cache hit**: <5ms
- **Network fetch**: 50-200ms (según tamaño JSON)
- **Binding copywriting**: <10ms (para ~50 elementos)

---

## 🐛 Debugging

Activar modo debug en `config.js`:

```javascript
export const CONFIG = {
  DEBUG_MODE: true
  // ...
};
```

Logs disponibles:

```
[DataManager] Cargando: data/products.json
[DataManager] ✓ Cargado: products { items: 42 }
[DataManager] Cache hit: products
[CopyBinder] Cargando copywriting...
[CopyBinder] Enlazando 24 elementos con data-copy
[CopyBinder] ✓ Copy aplicado: hero.title
[CopyBinder] ✓ Copywriting enlazado
```

---

## ⚙️ Configuración avanzada

### Cambiar TTL del caché

```javascript
// En data-manager.js
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
```

### Cambiar timeout de fetch

```javascript
const products = await DataManager.loadData('products', {
  timeout: 5000 // 5 segundos
});
```

### Añadir nuevo endpoint

```javascript
// En data-manager.js
const ENDPOINTS = {
  // ... existentes
  testimonials: 'data/testimonials.json'
};

// Usar
const testimonials = await DataManager.loadData('testimonials');
```

---

## 🔗 Integración con app.js legacy

El sistema es **100% compatible** con `app.js` existente:

- `app.js` sigue cargando datos con su función `loadJSON()` propia
- Los módulos ES6 cargan datos con `DataManager`
- Ambos coexisten sin conflictos
- Migración gradual: ir reemplazando `loadJSON()` por `DataManager.loadData()`

---

## 📝 TODO

- [ ] Migrar `loadPromos()` de app.js a usar `DataManager.getActivePromos()`
- [ ] Migrar `loadFAQ()` a usar `DataManager.getFAQ()`
- [ ] Añadir binding de copywriting al catálogo de productos
- [ ] Crear helper para actualizar microcopy dinámico

---

**Última actualización:** 26 octubre 2025  
**Versión:** 2.0.0
