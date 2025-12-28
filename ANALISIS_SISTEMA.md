# ?? Analisis del Sistema - Mahitek 3D Lab MX

Este documento describe el estado del proyecto y se mantiene **parcialmente automatico** para evitar desactualizacion.

## Objetivo

- Tener un inventario confiable de archivos/estructura (para auditoria y mantenimiento).
- Detectar cambios "significativos" en el sistema (UI/CSS/JS/datos/scripts/CI) y exigir que el analisis se actualice.

## Mantenimiento automatico

- Actualizar: `npm run docs:update` (regenera la seccion autogenerada).
- Verificar: `npm run validate` (incluye `validate:docs` y falla si el fingerprint no coincide).
- Auto en commits: `.\scripts\instalar-hooks.ps1` instala un `pre-commit` que ejecuta `npm run docs:update` y agrega `ANALISIS_SISTEMA.md`.

## Alcance del fingerprint (cambios "significativos")

El fingerprint considera contenido y rutas de:

- `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`
- `assets/css/**`, `assets/js/**`, `assets/data/**`, `data/**`
- `.github/workflows/**`
- `scripts/**`
- `package.json`, `package-lock.json`

Cambios fuera de ese alcance (p. ej. docs Markdown) no fuerzan actualizacion.

---
<!-- AUTO-GENERATED:START -->

Generado: 2025-12-28T12:45:12.515Z
Fingerprint: sha256:49ca49be1b73c7bee3a37bbafd770210a5284bdddc12fb21ae56d4a832cfb415
Archivos hasheados: 72

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
| `.js` | 41 |
| `.md` | 31 |
| `.ini` | 23 |
| `.json` | 17 |
| `.ps1` | 12 |
| `(sin-ext)` | 9 |
| `.html` | 3 |
| `.css` | 3 |
| `.yml` | 2 |
| `.png` | 2 |
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

Scripts npm (28):
- `build`
- `build:public`
- `check:format`
- `deploy`
- `dev`
- `dev:open`
- `docs:check`
- `docs:update`
- `format`
- `format:css`
- `format:html`
- `format:js`
- `monitor`
- `postinstall`
- `preinstall`
- `serve`
- `start`
- `validate`
- `validate:docs`
- `validate:encoding`
- `validate:html`
- `validate:links`
- `validate:public`
- `validate:public:critical`
- `version:major`
- `version:minor`
- `version:patch`
- `watch:css`

Diagnostico rapido:
- Datos: Productos: 16/16 activos (placeholders: 0) | Promos: 3/32 activas | FAQ: 20 items
- Imagenes sin referencia detectada (1): mark-icon.svg
- Archivos de sistema detectados (23): .github/desktop.ini, .github/workflows/desktop.ini, admin/desktop.ini, assets/css/desktop.ini, assets/css/modules/desktop.ini, assets/data/desktop.ini, assets/desktop.ini, assets/img/desktop.ini, assets/js/desktop.ini, assets/js/modules/desktop.ini, data/desktop.ini, desktop.ini, ...
- brand.json incluye social; data/social.json queda como fallback.
- NEWSLETTER_TURNSTILE_SITEKEY vacio (modo sin Turnstile).
- No se encontro LICENSE en la raiz (README lo referencia).
- lighthouserc.ci.json existe, pero no esta referenciado en workflows.
- public/ existe en disco (salida generada). Verifica que no se versiona.

<!-- AUTO-GENERATED:END -->
