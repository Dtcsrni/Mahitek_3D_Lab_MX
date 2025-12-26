# Mahitek 3D Lab MX - Landing Page Oficial

[![CI/CD](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions/workflows/ci.yml/badge.svg)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-mahitek3dlab.com-success)](https://mahitek3dlab.com/)

[![LH Performance](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-performance.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH Accessibility](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-accessibility.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH Best Practices](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-best-practices.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH SEO](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-seo.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)

Landing page estática para Mahitek 3D Lab MX. Sitio sin build obligatorio, con catálogo y promos cargadas desde JSON, y mejoras visuales progresivas vía ESM.

## Quick start

```bash
npm ci
npm run dev
```

Validación local (requerida antes de cerrar un ticket):

```bash
npm run validate
```

## Estructura del proyecto

- `index.html` Entrada principal del sitio.
- `assets/css/styles.css` CSS principal del landing.
- `assets/css/modules/animations.css` Utilidades de animación cargadas en el HTML.
- `assets/js/app.js` Entry point en ESM (orquestador de módulos y render).
- `assets/js/modules/*` Módulos ESM por sistema (catálogo, promos, FAQ, navbar, newsletter, etc.).
- `data/*.json` Datos de catálogo, promos, FAQ y redes.
- `assets/data/brand.json` Marca, tagline y redes (prioridad sobre `data/social.json`).
- `admin/` Panel estático para administrar campañas del Worker.
- `qr/` Landing de redirección con UTM/GA4.
- `workers/mahiteklab-api/` API serverless (Cloudflare Workers + D1) usada por el sitio y el admin.
- `scripts/` Validaciones, build de `public/` y utilidades.
- `docs/` Documentación técnica y backlog.

## Runtime (landing)

- `assets/js/app.js` orquesta el runtime modular y carga datos desde `data/*.json` y `assets/data/brand.json`.
- Los módulos en `assets/js/modules/` encapsulan sistemas individuales (render, UI, seguridad, validaciones).
- `assets/js/modules/validation.js` aplica validaciones de esquema por módulo (catálogo, promos, FAQ, brand, newsletter).
- `assets/js/modules/health-report.js` registra health checks y reporta en consola cuando hay alertas (o en modo debug).
- `assets/js/modules/system-checks.js` ejecuta verificaciones ligeras de DOM y dependencias críticas.

## Datos editables

`data/products.json` (catálogo):
- Campos usados por el runtime: `id`, `nombre`, `categoria`, `precio_mxn`, `precio_rango_mxn`, `imagen`, `material`, `descripcion`, `incluye`, `variantes`, `sugerencias`, `estado`, `tags`.
- `imagen` puede ser URL o emoji; si está vacía se usa placeholder.

`data/promos.json` (promos activas):
- Campos claves: `id`, `titulo`, `subtitulo`, `precio_regular` o `precio_especial`, `icono`, `desde`, `hasta`, `estado`.

`data/faq.json` (preguntas frecuentes):
- Campos usados: `q`, `a`, `categoria`, `destacada`.

`data/social.json` (redes):
- Usado solo si `assets/data/brand.json` no trae el bloque `social`.

`assets/data/brand.json` (marca):
- `brand_name`, `tagline`, `location`, `social`, `contact`.

## Deploy

- `scripts/build-public.js` genera `public/` para GitHub Pages e incluye `admin/` y `qr/`.
- `public/` es generado y está en `.gitignore`.
- CI corre `npm run validate` y `npm run validate:public`.

## Inventario y conexiones

Para el análisis archivo por archivo y lista de archivos desconectados, ver:
- `docs/INVENTARIO_CONEXIONES.md`

## Licencia

MIT (ver `package.json`).
