# AGENTS.md (scope: repo completo)

Este repositorio es un sitio estático (GitHub Pages) con HTML/CSS/JS sin build obligatorio.

## Reglas rápidas (para agentes)

- Mantén los cambios pequeños y verificables (un ticket por PR).
- No hagas refactors masivos sin ticket explícito en `docs/AI_BACKLOG.md`.
- No cambies estilos globales (tokens/root) si no es necesario.
- Siempre ejecuta `npm run validate` antes de terminar un ticket.

## Comandos (local)

- Instalar: `npm ci` (preferido) o `npm install`
- Validar (igual que CI): `npm run validate`
- Validar deploy (`public/`): `npm run validate:public`
- Servir local: `npm run dev` (puerto 8080)
- Actualizar docs del sistema: `npm run docs:update`

## Documentación automática (ANALISIS_SISTEMA.md)

- `ANALISIS_SISTEMA.md` incluye una sección autogenerada con inventario y fingerprint (sha256) del sistema.
- `npm run validate` actualiza `ANALISIS_SISTEMA.md` en local y valida el fingerprint (en CI solo valida).
- Para que se actualice automáticamente al commitear: ejecuta `.\scripts\instalar-hooks.ps1` (el pre-commit corre `npm run docs:update`).

## Archivos clave

- UI: `index.html`
- CSS: `assets/css/styles.css` (principal), `assets/css/modules/animations.css` (utilidades)
- Runtime ESM: `assets/js/app.js` + `assets/js/modules/*`
- Datos: `data/*.json` y `assets/data/brand.json`
- CI/CD: `.github/workflows/ci.yml` y `.github/workflows/lighthouse.yml`
- Validaciones: `scripts/validate-encoding.js`, `scripts/check-analisis-sistema.js`, `scripts/validate-html.js`, `scripts/validate-links.js`

## Definition of Done (DoD) para cada ticket

- `npm run validate` pasa.
- No hay recursos locales rotos (scripts/links/images/css url()).
- Cambios documentados en el ticket (qué/por qué/archivos tocados).

## Nota importante: Git en Windows (desktop.ini / refs)

Si ves warnings tipo “ignoring broken ref refs/.../desktop.ini” o errores al sincronizar:

- Evita que Windows cree `desktop.ini` dentro de `.git`:
  - No abras `.git` en Explorer, y mantén `desktop.ini` ignorado.
- Este repo puede estar usando `reftable` (`.git/config` -> `extensions.refstorage=reftable`).
  - Fix recomendado: `git refs migrate --ref-format=files`
  - Luego: `git fsck --full` y `git gc`
