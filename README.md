# Mahitek 3D Lab — Landing Moderna

Landing estática moderna con diseño oscuro + glassmorphism, sistema de precios y optimizada para tráfico QR, redes sociales y búsqueda directa.

## 🚀 Características

- **Diseño dark + glass**: Fondo oscuro (#0B0F14) con efectos glassmorphism
- **Sistema de precios automático**: Calcula precio venta = base con redondeo configurable
- **Catálogo dinámico**: Filtros por categoría y búsqueda en tiempo real
- **Emojis sobrios**: Iconografía visual sin sobrecarga
- **Performance optimizado**: Sin dependencias pesadas, solo vanilla JS

## 📁 Estructura

```
/index.html                  → Landing principal
/assets/css/styles.css       → Estilos modernos dark + glass
/assets/js/app.js           → Lógica, cálculo precios, carga datos
/assets/img/                → Imágenes, logos, productos
/data/products_base.json    → Catálogo con precios base
/data/products.json         → [DEPRECADO] Migrar a products_base.json
/data/promos.json          → Promociones activas
/data/social.json          → Enlaces redes sociales
/data/faq.json             → Preguntas frecuentes
```

## ⚙️ Sistema de Precios

El sistema calcula automáticamente precios de venta basándose en:

**Fórmula**: `precio_venta = round_to_step(precio_base × multiplicador, step)`

### Configuración en `/assets/js/app.js`

```javascript
const CONFIG = {
  PRICE_MARKUP: 1.0,   // 1 = precio base; aumenta si necesitas recargo
  PRICE_STEP: 10,      // Redondea a múltiplos de 10 MXN
  ...
};
```

### Ejemplo de cálculo

```
Precio base: $200 MXN
Multiplicador: 1.15 (15% de recargo)
Cálculo: $200 × 1.15 = $230
Redondeo: step=10 → $230 MXN

Precio base: $185 MXN
Multiplicador: 1.10 (10% de recargo)
Cálculo: $185 × 1.10 = $203.5
Redondeo: step=10 → $200 MXN
```

## 📝 Editar Contenido

### Catálogo (`/data/products_base.json`)

```json
[
  {
    "id": "producto-id",
    "nombre": "Nombre del producto",
    "categoria": "colgantes",
    "precio_base_mxn": 200,
    "imagen": "/assets/img/producto.svg",
    "coda": "Una frase corta",
    "historia": "Descripción del producto y su uso",
    "material_preferente": "PETG",
    "estado": "activo",
    "tags": ["ligero", "local", "PETG"]
  }
]
```

**Campos obligatorios:**
- `id`: Identificador único
- `nombre`: Nombre del producto
- `categoria`: Categoría para filtros
- `precio_base_mxn`: Precio base (el multiplicador se define en `app.js`)
- `imagen`: Ruta a la imagen
- `material_preferente`: Material principal (PETG recomendado)
- `estado`: `"activo"` para mostrar, `"inactivo"` para ocultar

**Campos opcionales:**
- `coda`: Frase poética corta
- `historia`: Descripción detallada
- `tags`: Array de etiquetas para búsqueda
- `variantes`: Array de variantes disponibles

### Promociones (`/data/promos.json`)

```json
[
  {
    "id": "promo-id",
    "titulo": "Título de la promoción",
    "mensaje": "Descripción de la oferta",
    "desde": "2025-01-01",
    "hasta": "2025-12-31",
    "cta_text": "Texto del botón",
    "cta_url": "https://wa.me/52XXXXXXXXXX?text=..."
  }
]
```

Solo se muestran las promociones cuya fecha actual esté entre `desde` y `hasta`.

### Redes Sociales (`/data/social.json`)

```json
{
  "instagram": "https://www.instagram.com/usuario/",
  "facebook": "https://www.facebook.com/pagina",
  "tiktok": "https://www.tiktok.com/@usuario"
}
```

### FAQ (`/data/faq.json`)

```json
[
  {
    "q": "¿Pregunta?",
    "a": "Respuesta clara y concisa."
  }
]
```

## 🛠️ Desarrollo Local

No requiere build ni dependencias:

```bash
# Opción 1: Servidor simple con Python
python -m http.server 8000

# Opción 2: Con Node.js
npx serve .

# Opción 3: Live Server (VS Code extension)
```

Luego abre `http://localhost:8000` en tu navegador.

## 🌐 Despliegue en GitHub Pages

1. Haz commit de tus cambios:
   ```bash
   git add .
   git commit -m "Actualizar catálogo"
   git push origin main
   ```

2. Activa GitHub Pages:
   - Ve a **Settings** → **Pages**
   - Source: Deploy from branch
   - Branch: `main` / `root`
   - Guarda cambios

3. Espera 1-2 minutos y visita tu sitio en:
   `https://[usuario].github.io/[repositorio]/`

## 🎨 Personalización

### Cambiar colores

Edita variables en `/assets/css/styles.css`:

```css
:root {
  --bg-dark: #0B0F14;           /* Fondo principal */
  --accent-cyan: #06B6D4;       /* Color acento 1 */
  --accent-green: #10B981;      /* Color acento 2 */
  --glass-bg: rgba(255, 255, 255, 0.06);  /* Fondo glass */
  ...
}
```

### Cambiar markup de precios

Edita en `/assets/js/app.js`:

```javascript
const CONFIG = {
  PRICE_MARKUP: 1.15,  // 15% de recargo
  PRICE_STEP: 5,       // Redondear a múltiplos de 5
  ...
};
```

### Cambiar número de WhatsApp

En `/assets/js/app.js`:

```javascript
const CONFIG = {
  WHATSAPP_NUMBER: '521234567890',  // Tu número con código de país
  ...
};
```

También actualiza en `/index.html` todos los enlaces `https://wa.me/52XXXXXXXXXX`.

## 📱 WhatsApp QR-first

Para crear enlaces con contexto desde stickers/QR:

```
https://tu-sitio.com/?src=qr&utm_source=sticker
https://tu-sitio.com/?src=qr&utm_source=lona
https://tu-sitio.com/?src=instagram
```

El sistema detecta estos parámetros y ajusta el mensaje de WhatsApp automáticamente.

## ♿ Accesibilidad

- Semántica HTML5 completa
- Contraste WCAG AA
- Teclado navegable
- `prefers-reduced-motion` respetado
- Skip link para lectores de pantalla

## 📊 Performance

- Sin dependencias externas
- CSS y JS inline cuando sea posible
- Imágenes SVG optimizadas
- Lazy loading en imágenes
- Objetivo: Lighthouse ≥90 en todas las métricas

## 🐛 Debugging

Abre la consola del navegador para ver información de debug:

```javascript
// Ver configuración actual
console.log(window.MahitekLab.config);

// Ver productos cargados
console.log(window.MahitekLab.products());

// Calcular precio manualmente
window.MahitekLab.calculateSalePrice(200); // → 260
```

## 📄 Licencia

Proyecto propietario de Mahitek 3D Lab.
