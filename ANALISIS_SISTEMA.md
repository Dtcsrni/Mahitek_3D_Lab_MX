# ?? Análisis del Sistema - Mahitek 3D Lab MX

Este documento describe el estado del proyecto y se mantiene **parcialmente automático** para evitar desactualización.

## Objetivo

- Tener un inventario confiable de archivos/estructura (para auditoria y mantenimiento).
- Detectar cambios "significativos" en el sistema (UI/CSS/JS/datos/scripts/CI) y exigir que el Análisis se actualice.

## Mantenimiento automático

- Actualizar: `npm run docs:update` (regenera la sección autogenerada).
- Verificar: `npm run validate` (incluye `validate:docs` y falla si el fingerprint no coincide).
- Auto en commits: `.\scripts\instalar-hooks.ps1` instala un `pre-commit` que ejecuta `npm run docs:update` y agrega `ANALISIS_SISTEMA.md`.

## Alcance del fingerprint (cambios "significativos")

El fingerprint considera contenido y rutas de:

- `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`
- `assets/css/**`, `assets/js/**`, `assets/data/**`, `data/**`
- `.github/workflows/**`
- `scripts/**`
- `package.json`, `package-lock.json`

Cambios fuera de ese alcance (p. ej. docs Markdown) no fuerzan actualización.

---
<!-- AUTO-GENERATED:START -->

Generado: 2026-01-04T08:21:36.246Z
Fingerprint: sha256:95a8f774cd062c86193521bd74405428ac541e333c0486a7f6a555360b16f0f6
Archivos hasheados: 76

Criterio del fingerprint (cambios significativos):
- Root: `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `package.json`, `package-lock.json`
- `assets/js/**/*.js`, `assets/css/**/*.css`
- `assets/data/**/*.json`, `data/**/*.json`
- `.github/workflows/**/*.{yml,yaml}`
- `scripts/**/*.{js,ps1,sh,bat}`
- `admin/**/*.{html,css,js}` + `admin/_headers`
- `workers/**/*.{js,toml,md,sql}`

Inventario (excluye .git/node_modules/public):

| Ext | Conteo |
| --- | -----: |
| `.svg` | 62 |
| `.js` | 44 |
| `.md` | 31 |
| `.ini` | 24 |
| `.json` | 18 |
| `.ps1` | 12 |
| `(sin-ext)` | 9 |
| `.css` | 4 |
| `.html` | 3 |
| `.yml` | 2 |
| `.png` | 2 |
| `.jpg` | 1 |
| `.mp4` | 1 |
| `.webm` | 1 |
| `.code-workspace` | 1 |
| `.txt` | 1 |
| `.xml` | 1 |
| `.bat` | 1 |
| `.sh` | 1 |
| `.sql` | 1 |
| `.toml` | 1 |

HTML detectados (3):
- admin/index.html
- index.html
- qr/index.html

Workflows (3):
- .github/workflows/ci.yml
- .github/workflows/desktop.ini
- .github/workflows/lighthouse.yml

Scripts npm (0):

Diagnóstico rápido:
- Datos: Productos: 16/16 activos (placeholders: 0) | Promos: 0/3 activas | FAQ: 18 items
- index.html no referencia assets/css/modules/animations.css.
- CSS sin referencia en index.html (1): animations.css
- Módulos JS sin import en app.js (6): faq.js, hero-counters.js, promos.js, scroll-narrative.js, social.js, svg-animations.js
- Imágenes sin referencia detectada (30): mark-icon.svg, promo-addon-sticker.svg, promo-back-to-school.svg, promo-click-pick.svg, promo-club.svg, promo-combo-pack6-envio.svg, promo-combo-quetzal.svg, promo-combo-zombies.svg, promo-envio-online.svg, promo-figura-duo.svg, promo-figura-med.svg, promo-key-outlet.svg, ...
- Archivos de sistema detectados (24): .github/desktop.ini, .github/workflows/desktop.ini, admin/desktop.ini, assets/css/desktop.ini, assets/css/modules/desktop.ini, assets/data/desktop.ini, assets/desktop.ini, assets/img/desktop.ini, assets/js/desktop.ini, assets/js/modules/desktop.ini, assets/video/desktop.ini, data/desktop.ini, ...
- brand.json incluye social; data/social.json queda como fallback.
- NEWSLETTER_TURNSTILE_SITEKEY vacío (modo sin Turnstile).
- No se encontró LICENSE en la raíz (README lo referencia).
- lighthouserc.ci.json existe, pero no está referenciado en workflows.
- public/ existe en disco (salida generada). Verifica que no se versiona.

<!-- AUTO-GENERATED:END -->

