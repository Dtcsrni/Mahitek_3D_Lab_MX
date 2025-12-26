# Arquitectura (agent-friendly)

## Objetivo

Mantener el sitio estable (sin build obligatorio) y reducir duplicación/fragilidad para que agentes puedan contribuir con tickets pequeños sin romper secciones.

## Runtime modular (fuente de verdad)

- `assets/js/app.js` orquesta el runtime ESM y es la entrada principal.
- `assets/js/modules/*` concentra los sistemas (catálogo, promos, FAQ, navbar, newsletter, seguridad, validaciones).
- Reglas:
  - El render de datos solo se ejecuta en módulos dedicados (catálogo/promos/FAQ).
  - Los módulos reutilizan helpers de seguridad (`escapeHTML`, `sanitizeURL`).
  - Las mejoras visuales (scroll narrative, SVG animado, contadores) se inicializan desde `app.js` sin duplicar datos.
  - `validation.js` consolida validaciones por módulo para datos y configuración.
  - `health-report.js` registra health checks y reporta alertas en consola.
  - `system-checks` valida DOM y dependencias críticas al iniciar.

## Datos

Archivos de datos usados por `app.js`:

- `data/products.json` (catálogo)
- `data/promos.json` (promos)
- `data/faq.json` (FAQ)
- `assets/data/brand.json` (marca/redes)

Notas:
- `docs/archive/data/copywriting.json` existe para copy declarativo (`data-copy`), pero si no hay binder activo, el HTML debe traer texto por defecto.

## Validaciones (CI / local)

- `npm run validate`
  - `prettier --check`
  - `scripts/validate-html.js` (semántica base + recursos del HTML)
  - `scripts/validate-links.js` (links/recursos locales en HTML + `url()` en CSS)
  - `scripts/validate-encoding.js` (mojibake en archivos críticos)

## Deploy (GitHub Pages)

- CI genera `public/` con `node scripts/build-public.js`.
- Pages sube solo `public/` (evita exponer `scripts/`, `docs/`, `test-*.html`, etc.).

## Headers/CSP (`_headers`)

- GitHub Pages ignora `_headers`.
- El archivo `_headers` existe como configuración opcional para hosts que sí lo respeten (Netlify/Cloudflare Pages).
- Regla: evitar scripts inline en `index.html` para mantener CSP estricta (analytics se carga desde `assets/js/app.js`).

## Convención para tickets

- Cambios mínimos, un objetivo.
- Siempre incluir comando de verificación en el ticket.
- Antes de terminar: `npm run validate`.
