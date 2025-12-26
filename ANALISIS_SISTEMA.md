# 🔍 Análisis del Sistema — Mahitek 3D Lab MX

Este documento describe el estado del proyecto y se mantiene **parcialmente automático** para evitar desactualización.

## Objetivo

- Tener un inventario confiable de archivos/estructura (para auditoría y mantenimiento).
- Detectar cambios “significativos” en el sistema (UI/CSS/JS/datos/scripts/CI) y exigir que el análisis se actualice.

## Mantenimiento automático

- Actualizar: `npm run docs:update` (regenera la sección autogenerada).
- Verificar: `npm run validate` (incluye `validate:docs` y falla si el fingerprint no coincide).
- Auto en commits: `.\scripts\instalar-hooks.ps1` instala un `pre-commit` que ejecuta `npm run docs:update` y agrega `ANALISIS_SISTEMA.md`.

## Alcance del fingerprint (cambios “significativos”)

El fingerprint considera contenido y rutas de:

- `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`
- `assets/css/**`, `assets/js/**`, `assets/data/**`, `data/**`
- `.github/workflows/**`
- `scripts/**`
- `package.json`, `package-lock.json`

Cambios fuera de ese alcance (p. ej. docs Markdown) no fuerzan actualización.

---

<!-- AUTO-GENERATED:START -->

Generado: 2025-12-26T07:29:57.845Z
Fingerprint: sha256:c9b3d131041f3a80b2c10164417e93f0e3af258be99f5f36d28d794944153373
Archivos hasheados: 52

Criterio del fingerprint (cambios “significativos”):
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
| `.svg` | 46 |
| `.ini` | 32 |
| `.md` | 31 |
| `.js` | 21 |
| `.json` | 18 |
| `.ps1` | 12 |
| `(sin-ext)` | 8 |
| `.html` | 3 |
| `.css` | 3 |
| `.yml` | 2 |
| `.png` | 2 |
| `.log` | 2 |
| `.err` | 2 |
| `.code-workspace` | 1 |
| `.txt` | 1 |
| `.xml` | 1 |
| `.bat` | 1 |
| `.sh` | 1 |
| `.sqlite` | 1 |
| `.sqlite-shm` | 1 |
| `.sqlite-wal` | 1 |
| `.ts` | 1 |
| `.map` | 1 |
| `.sql` | 1 |
| `.toml` | 1 |

HTML detectados (3):
- admin/index.html
- index.html
- qr/index.html

Workflows (2):
- .github/workflows/ci.yml
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

<!-- AUTO-GENERATED:END -->
