# 🔮 Mahitek 3D Lab MX — Landing Page Oficial

[![CI/CD](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions/workflows/ci.yml/badge.svg)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-mahitek3dlab.com-success)](https://mahitek3dlab.com/)

<!-- Badges dinámicos de Lighthouse (se actualizan en cada pipeline) -->

[![LH Performance](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-performance.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH Accessibility](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-accessibility.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH Best Practices](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-best-practices.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH SEO](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-seo.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)

Landing page moderna con diseño cyberpunk mexicano, sistema de precios automático y optimización completa para dispositivos móviles. Impresión 3D funcional en PETG desde Pachuca, Hidalgo.

## ✨ Características Principales

### 🎨 Diseño y UX

- **Diseño cyberpunk mexicano**: Navbar con nopales, águilas y efectos glitch
- **Glassmorphism dark**: Fondo oscuro (#0B0F14) con efectos de cristal
- **Tipografía fluida**: Escala responsive desde móvil (320px) hasta 4K (1440+)
- **Full viewport**: Aprovecha toda la pantalla con safe-area para notches
- **Hero prioritario**: Primera vista siempre visible a pantalla completa
- **Animaciones GPU**: Optimizadas con `will-change` y `transform`

### 📱 Responsive y Accesibilidad

- **Mobile-first**: Diseñado desde 320px hasta pantallas 2XL (1536+)
- **Safe-area support**: Compatible con iPhone notch y Android punch-hole
- **Navbar inteligente**: 4 estados (normal, scrolled, compact, hidden)
- **Touch-friendly**: Targets mínimos de 44px (Apple HIG)
- **Reduced motion**: Respeta preferencias de accesibilidad
- **Detección de capacidades**: Degrada efectos en dispositivos limitados

### 🛠️ Sistema de Datos

- **Catálogo dinámico**: Filtros por categoría y búsqueda en tiempo real
- **Sistema de precios automático**: Cálculo con markup y redondeo configurable
- **Promociones activas**: Con fechas de validez y animaciones personalizadas
- **FAQ interactivas**: Expandibles, buscables y con JSON-LD para SEO
- **Multiidioma**: Soporte para es-MX, es-ES y en-US

### ⚡ Performance

- **Zero dependencias**: Solo vanilla JS moderno
- **Lazy loading**: Secciones no críticas cargan on-demand
- **Content-visibility**: Defer de pintura en elementos fuera de pantalla
- **Optimización de imágenes**: Lazy, decoding async, dimensiones explícitas
- **GPU acceleration**: Animaciones con `transform` y `opacity`
- **ResizeManager**: Manejo centralizado de eventos resize

## 📁 Estructura del Proyecto

```
Mahitek_3D_Lab_MX/
├── 📄 index.html                    # Landing principal
├── 📁 assets/
│   ├── 📁 css/
│   │   └── styles.css               # ~6000 líneas de CSS optimizado
│   ├── 📁 js/
│   │   └── app.js                   # ~1600 líneas de lógica vanilla JS
│   ├── 📁 img/                      # Imágenes, logos, ilustraciones
│   └── 📁 data/
│       └── brand.json               # Info de marca y social
├── 📁 data/
│   ├── products.json                # Catálogo con precios base
│   ├── promos.json                  # Promociones activas
│   ├── faq.json                     # Preguntas frecuentes
│   └── social.json                  # Enlaces redes sociales
├── 📁 .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
├── 📁 .vscode/                      # Configuración VS Code
│   ├── settings.json                # Formateo automático
│   ├── tasks.json                   # Tareas automatizadas
│   ├── extensions.json              # Extensiones recomendadas
│   └── *.code-snippets              # Snippets personalizados
├── 📄 package.json                  # Scripts NPM y dependencias dev
├── 📄 .prettierrc                  # Configuración Prettier
├── 📄 .prettierignore              # Exclusiones Prettier
├── 📄 .hintrc                      # Validación HTML (hint)
├── 📄 DESARROLLO.md                 # Guía de desarrollo
├── 📄 NAVBAR_INTELIGENTE.md        # Documentación navbar
├── 📄 NAVBAR_CYBERPUNK.md          # Diseño cyberpunk
└── 📄 README.md                     # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Servidor de Desarrollo NPM

```bash
# 1. Instalar dependencias de desarrollo
npm install

# 2. Iniciar servidor
npm run dev

# El sitio estará en http://localhost:8080
```

### Opción 2: Live Server de VS Code

1. Instalar extensión **Live Server** (si no la tienes)
2. Clic derecho en `index.html`
3. Seleccionar **"Open with Live Server"**

### Opción 3: Python Simple Server

```bash
python -m http.server 8080
```

## ⚙️ Sistema de Precios Automático

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

## ⚙️ Scripts de Desarrollo

El proyecto incluye scripts NPM para automatizar tareas comunes:

```bash
# 🚀 Desarrollo
npm run dev              # Iniciar servidor local (puerto 8080)
npm run dev:open         # Abrir navegador con live-server
npm run serve            # Servidor alterno simple

# ✅ Validación
npm run validate         # Formato (Prettier) + validación HTML + links/recursos
npm run check:format     # Solo verificación de formato (Prettier)
npm run validate:html    # Validación semántica de index.html (JSDOM)
npm run validate:links   # Links/recursos locales (HTML + url() en CSS)

# 💅 Formateo
npm run format           # Formatear todo el proyecto
```

## 🔧 Extensiones de VS Code Recomendadas

El proyecto está configurado para aprovechar estas extensiones:

- **ESLint** - Linting de JavaScript
- **Prettier** - Formateo automático
- **Live Server** - Servidor de desarrollo
- **Live Sass Compiler** - Compilación SASS
- **HTML CSS Support** - Autocompletado CSS
- **IntelliSense for CSS** - Autocompletado inteligente
- **GitHub Copilot** - Asistente IA (opcional)
- **Edge DevTools** - Depuración integrada

> 💡 Al abrir el proyecto en VS Code, se te sugerirá instalar las extensiones recomendadas.

## 🎨 Snippets Personalizados

El proyecto incluye snippets para acelerar el desarrollo:

### HTML

- `mhk-card` - Tarjeta glass con animación
- `mhk-section-full` - Sección full-screen completa
- `mhk-product` - Tarjeta de producto
- `mhk-accent` - Texto con acento de color

### CSS

- `mhk-glass` - Efecto glassmorphism
- `mhk-anim-fadeup` - Animación fade-up
- `mhk-gradient` - Gradiente de acentos
- `mhk-container` - Container responsive
- `mhk-fluid-text` - Tipografía fluida

Escribe el prefijo y presiona `Tab` para expandir el snippet.

## ¿📝 Editar Contenido

### Catálogo (`/data/products.json`)

```json
[
  {
    "id": "producto-id",
    "nombre": "Nombre del producto",
    "categoria": "colgantes",
    "precio_base_mxn": 200,
    "imagen": "🧩",
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
    "cta_url": "https://wa.me/52XXXXXXXXXX¿Text=..."
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
    "a": "Respuesta clara y concisa.",
    "categoria": "general",
    "destacado": true
  }
]
```

## 🌐 Deploy y CI/CD

### GitHub Pages (Automático)

El proyecto está configurado con GitHub Actions para deploy automático:

1. **Commit y push** a la rama `main`
2. GitHub Actions ejecuta automáticamente:
   - ✅ Validación de JavaScript (ESLint)
   - ✅ Validación de CSS (Stylelint)
   - ✅ Verificación de formateo (Prettier)
   - 🔍 Auditoría Lighthouse de performance
   - 🚀 Deploy a GitHub Pages
3. El sitio se actualiza en ~2 minutos

Ver estado del CI/CD: [Actions](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)

### Configuración Manual de GitHub Pages

Si no se ha configurado:

1. Ve a **Settings** → **Pages**
2. Source: **GitHub Actions** (recomendado) o **Deploy from branch**
3. Si usas branch: selecciona `main` / `root`
4. Guarda cambios

Sitio disponible en: `https://mahitek3dlab.com/`

## 🎨 Personalización Avanzada

### Cambiar Colores del Tema

Edita variables CSS en `/assets/css/styles.css`:

```css
:root {
  /* Colores base */
  --bg-dark: #0b0f14; /* Fondo principal */
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.12);

  /* Colores de texto */
  --text-primary: #e8edf4;
  --text-secondary: #9ca3af;

  /* Acentos principales */
  --accent-cyan: #06b6d4;
  --accent-green: #10b981;
  --accent-red: #d22623;

  /* Tipografía fluida */
  --font-size-base: clamp(1rem, 0.94rem + 0.4vw, 1.125rem);

  /* Espaciado */
  --space-md: 1rem;
  --radius: 12px;
}
```

### Ajustar Breakpoints Responsive

```css
/* Puntos de quiebre actuales */
@media (min-width: 400px) {
  /* Móviles pequeños */
}
@media (min-width: 640px) {
  /* Móviles grandes */
}
@media (min-width: 768px) {
  /* Tablets */
}
@media (min-width: 1024px) {
  /* Desktop */
}
@media (min-width: 1280px) {
  /* Desktop grande */
}
@media (min-width: 1440px) {
  /* QHD */
}
@media (min-width: 1536px) {
  /* 2XL */
}
```

### Modificar Estados del Navbar

El navbar tiene 4 estados inteligentes documentados en `NAVBAR_INTELIGENTE.md`:

- **Normal**: Scroll en top (0-24px)
- **Scrolled**: Con scroll (24-100px) - fondo más opaco
- **Compact**: Scroll profundo (300+) - logo mini
- **Hidden**: Scroll hacia abajo (100+) - se oculta con peek

Configurar en `/assets/js/app.js`:

```javascript
const SCROLL_THRESHOLD = 24; // Activar is-scrolled
const HIDE_THRESHOLD = 100; // Ocultar navbar
const COMPACT_THRESHOLD = 300; // Modo compacto
```

### Agregar Nueva Sección

Usa el snippet `mhk-section-full` o copia el patrón:

```html
<section
  id="mi-seccion"
  class="section section--full section-alt"
  aria-labelledby="mi-seccion-title"
>
  <div class="container">
    <div class="section-header" data-animate="fade-up">
      <div class="section-heading">
        <img
          src="assets/img/logo-color.svg"
          alt="Mahitek 3D Lab"
          class="section-heading-logo"
          width="64"
          height="64"
          loading="lazy"
          decoding="async"
        />
        <h2 class="section-title" id="mi-seccion-title">Mi Nueva Sección</h2>
      </div>
      <p class="section-intro">Descripción de la sección.</p>
    </div>

    <!-- Contenido aquí -->
  </div>
</section>
```

## 📊 Performance y Optimización

### Métricas Actuales

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)

### Optimizaciones Implementadas

✅ **Carga Lazy**: Imágenes y secciones no críticas  
✅ **GPU Acceleration**: Animaciones con `transform` y `will-change`  
✅ **Content Visibility**: Defer de pintura en elementos fuera de pantalla  
✅ **Preconnect**: DNS prefetch para recursos externos  
✅ **Responsive Images**: Dimensiones explícitas y decoding async  
✅ **Debounce/Throttle**: Eventos resize y scroll optimizados  
✅ **ResizeManager**: Manejo centralizado de resize  
✅ **IntersectionObserver**: Animaciones activadas por scroll  
✅ **Device Detection**: Degradación de efectos en dispositivos limitados

### Auditoría Lighthouse

```bash
# Con GitHub Actions (automático en cada push)
# Ver resultados en: Actions → CI - Validación y Deploy

# Local con Chrome DevTools
# 1. Abrir DevTools (F12)
# 2. Tab "Lighthouse"
# 3. Generate report
```

## 🧪 Testing y Validación

### Validación Automática (CI)

El proyecto valida automáticamente en cada push:

```bash
# Ejecutar localmente las mismas validaciones del CI
npm run validate         # Prettier --check + validate-html + validate-links
npm run format           # Prettier --write (aplica formato)
```

### Testing Manual

1. **Responsive**: Probar en Chrome DevTools (F12 → Toggle Device Toolbar)
2. **Navegadores**: Chrome, Firefox, Safari, Edge
3. **Dispositivos reales**: iOS Safari, Android Chrome
4. **Accesibilidad**: Usar lector de pantalla (NVDA/JAWS)

### Herramientas de Debug

```javascript
// Consola del navegador
window.MahitekLab.products(); // Ver productos cargados
window.MahitekLab.config; // Ver configuración
window.MahitekLab.filterProducts(); // Aplicar filtros
```

## 📚 Documentación Adicional

- **[DESARROLLO.md](DESARROLLO.md)** - Guía completa de desarrollo
- **[NAVBAR_INTELIGENTE.md](NAVBAR_INTELIGENTE.md)** - Documentación del navbar
- **[NAVBAR_CYBERPUNK.md](NAVBAR_CYBERPUNK.md)** - Diseño cyberpunk
- **[PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)** - Auditoría de performance
- **[COMPRESSION.md](COMPRESSION.md)** - Optimización de recursos

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin afectar código)
- `refactor:` Refactorización de código
- `perf:` Mejoras de performance
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Simple Icons** - Iconos de redes sociales (CC0)
- **Google Fonts** - Tipografía web
- **GitHub Pages** - Hosting gratuito
- **VS Code** - Editor y herramientas de desarrollo

## 📞 Contacto

- **Email**: armsystechno@gmail.com
- **Messenger**: [m.me/mahitek3dlabmx](https://m.me/mahitek3dlabmx)
- **Sitio Web**: [mahitek3dlab.com](https://mahitek3dlab.com/)

---

**Mahitek 3D Lab** — _Memoria en forma, uso que perdura_ ✨
--glass-bg: rgba(255, 255, 255, 0.06); /_ Fondo glass _/
...
}

````

### Cambiar markup de precios

Edita en `/assets/js/app.js`:

```javascript
const CONFIG = {
  PRICE_MARKUP: 1.15,  // 15% de recargo
  PRICE_STEP: 5,       // Redondear a múltiplos de 5
  ...
};
````

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

