# Arquitectura (agent-friendly)

## Objetivo

Mantener el sitio estable (sin build obligatorio) y reducir duplicación/fragilidad para que agentes puedan contribuir con tickets pequeños sin romper secciones.

## Runtime “oficial” (fuente de verdad)

- **`assets/js/app.js`** es el runtime principal y **autoritativo** para:
  - Carga de datos (fetch de `data/*.json` y `assets/data/brand.json`)
  - Render del catálogo, promos y FAQ
  - Navegación, animaciones por scroll (`[data-animate]`), carruseles y filtros
  - Seguridad básica de render (`escapeHTML`, `sanitizeURL`)

En producción, si hay conflicto entre `app.js` y otros módulos, **gana `app.js`**.

## Runtime ESM (mejora progresiva)

- **`assets/js/boot.js`** se mantiene como **mejora progresiva**.
- Debe cumplir estas reglas:
  - No debe hacer fetch de JSON ni “duplicar” la carga de datos del sitio.
  - No debe re-renderizar secciones que ya renderiza `app.js`.
  - Sí puede añadir mejoras visuales no críticas (ej. barra de progreso de lectura).

## Datos

Archivos de datos usados por `app.js`:

- `data/products.json` (catálogo)
- `data/promos.json` (promos)
- `data/faq.json` (FAQ)
- `assets/data/brand.json` (marca/redes)

Notas:
- `data/copywriting.json` existe para copy declarativo (`data-copy`), pero si no hay binder activo, el HTML debe traer texto por defecto.

## Validaciones (CI / local)

- `npm run validate`
  - `prettier --check`
  - `scripts/validate-html.js` (semántica base + recursos del HTML)
  - `scripts/validate-links.js` (links/recursos locales en HTML + `url()` en CSS)

## Deploy (GitHub Pages)

- CI genera `public/` con `node scripts/build-public.js`.
- Pages sube **solo** `public/` (evita exponer `scripts/`, `docs/`, `test-*.html`, etc.).

## Headers/CSP (`_headers`)

- GitHub Pages ignora `_headers`.
- El archivo `_headers` existe como configuración **opcional** para hosts que sí lo respeten (Netlify/Cloudflare Pages).
- Regla: evitar scripts inline en `index.html` para mantener CSP estricta (analytics se carga desde `assets/js/app.js`).

## Convención para tickets

- Cambios mínimos, un objetivo.
- Siempre incluir comando de verificación en el ticket.
- Antes de terminar: `npm run validate`.
