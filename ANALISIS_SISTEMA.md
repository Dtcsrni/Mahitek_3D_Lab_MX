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

Generado: 2025-12-17T10:37:33.046Z
Fingerprint: sha256:83a3d61c1b40751e331e66aa11fa16d62207cc123131d8c4ae463439aa27ad37
Archivos hasheados: 51

Criterio del fingerprint (cambios “significativos”):
- Root: `index.html`, `manifest.json`, `robots.txt`, `sitemap.xml`, `package.json`, `package-lock.json`
- `assets/js/**/*.js`, `assets/css/**/*.css`
- `assets/data/**/*.json`, `data/**/*.json`
- `.github/workflows/**/*.{yml,yaml}`
- `scripts/**/*.{js,ps1,sh,bat}`

Inventario (excluye .git/node_modules/public):

| Ext | Conteo |
| --- | -----: |
| `.svg` | 79 |
| `.md` | 27 |
| `.js` | 19 |
| `.json` | 17 |
| `.ps1` | 11 |
| `.css` | 7 |
| `(sin-ext)` | 6 |
| `.html` | 4 |
| `.yml` | 2 |
| `.png` | 2 |
| `.code-workspace` | 1 |
| `.txt` | 1 |
| `.xml` | 1 |
| `.bat` | 1 |
| `.sh` | 1 |

HTML detectados (4):
- comparacion-svgs.html
- index.html
- qr/index.html
- visualizacion-promos.html

Workflows (2):
- .github/workflows/ci.yml
- .github/workflows/lighthouse.yml

Scripts npm (26):
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
- `version:major`
- `version:minor`
- `version:patch`
- `watch:css`

<!-- AUTO-GENERATED:END -->

