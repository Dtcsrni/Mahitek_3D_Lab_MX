# Mahitek 3D Lab MX - Landing Page Oficial

[![CI/CD](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions/workflows/ci.yml/badge.svg)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-mahitek3dlab.com-success)](https://mahitek3dlab.com/)

[![LH Performance](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-performance.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH Accessibility](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-accessibility.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH Best Practices](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-best-practices.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)
[![LH SEO](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDtcsrni%2FMahitek_3D_Lab_MX%2Fmain%2Fdocs%2Fbadges%2Flh-seo.json)](https://github.com/Dtcsrni/Mahitek_3D_Lab_MX/actions)

Landing page estatica para Mahitek 3D Lab MX. Sitio sin build obligatorio, con catalogo y promos cargadas desde JSON, y mejoras visuales progresivas via ESM.

## Quick start

```bash
npm ci
npm run dev
```

Validacion local (requerida antes de cerrar un ticket):

```bash
npm run validate
```

## Estructura del proyecto

- `index.html` Entrada principal del sitio.
- `assets/css/styles.css` CSS principal del landing.
- `assets/css/modules/animations.css` Utilidades de animacion cargadas en el HTML.
- `assets/js/app.js` Runtime principal (render de catalogo, promos, FAQ, navbar, animaciones basicas).
- `assets/js/boot.js` Mejora progresiva via ESM (scroll narrative, SVG animado, contadores).
- `assets/js/modules/*` Modulos ESM; solo algunos estan conectados (ver inventario).
- `data/*.json` Datos de catalogo, promos, FAQ y redes.
- `assets/data/brand.json` Marca, tagline y redes (prioridad sobre `data/social.json`).
- `admin/` Panel estatico para administrar campañas del Worker.
- `qr/` Landing de redireccion con UTM/GA4.
- `workers/mahiteklab-api/` API serverless (Cloudflare Workers + D1) usada por el sitio y el admin.
- `scripts/` Validaciones, build de `public/` y utilidades.
- `docs/` Documentacion tecnica y backlog.

## Runtime (landing)

- `assets/js/app.js` es la fuente de verdad del render y carga datos desde `data/*.json` y `assets/data/brand.json`.
- `assets/js/boot.js` solo agrega mejoras visuales. No debe duplicar carga de datos ni re-renderizar secciones.

## Datos editables

`data/products.json` (catalogo):
- Campos usados por el runtime: `id`, `nombre`, `categoria`, `precio_mxn`, `precio_rango_mxn`, `imagen`, `material`, `descripcion`, `incluye`, `variantes`, `sugerencias`, `estado`, `tags`.
- `imagen` puede quedar en `"??"` para usar placeholder.

`data/promos.json` (promos activas):
- Campos claves: `id`, `titulo`, `subtitulo`, `precio_regular` o `precio_especial`, `icono`, `desde`, `hasta`, `estado`.

`data/faq.json` (preguntas frecuentes):
- Campos usados: `q`, `a`, `categoria`, `destacado`.

`data/social.json` (redes):
- Usado solo si `assets/data/brand.json` no trae el bloque `social`.

`assets/data/brand.json` (marca):
- `brand_name`, `tagline`, `location`, `social`, `contact`.

## Deploy

- `scripts/build-public.js` genera `public/` para GitHub Pages e incluye `admin/` y `qr/`.
- `public/` es generado y esta en `.gitignore`.
- CI corre `npm run validate` y `npm run validate:public`.

## Inventario y conexiones

Para el analisis archivo por archivo y lista de archivos desconectados, ver:
- `docs/INVENTARIO_CONEXIONES.md`

## Licencia

MIT (ver `package.json`).
