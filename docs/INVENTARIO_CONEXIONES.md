# Inventario de conexiones (archivo por archivo)

## Metodologia

- Se revisaron referencias en `index.html`, `admin/index.html`, `qr/index.html`, `assets/js/app.js`, `assets/js/boot.js` y `data/*.json`.
- Se reviso el build `scripts/build-public.js` y los workflows de CI.
- Este inventario indica si cada archivo esta conectado al runtime, al deploy o si es documentacion/manual.

## Entradas principales

- `index.html` -> `assets/css/styles.css`, `assets/css/modules/animations.css`, `assets/js/app.js`, `assets/js/boot.js`, `manifest.json`, imagenes `assets/img/*`.
- `admin/index.html` -> `admin/styles.css`, `admin/app.js`.
- `qr/index.html` -> `qr/qr.js` (CSS inline).
- `workers/mahiteklab-api/src/index.js` -> API usada por `assets/js/app.js` (NEWSLETTER_API_BASE) y `admin/app.js` (DEFAULT_API_BASE).

## Root y configuracion

- `CNAME` -> usado por GitHub Pages (dominio custom).
- `manifest.json` -> referenciado por `index.html`.
- `robots.txt` -> consumido por crawlers (no requiere referencia directa).
- `sitemap.xml` -> consumido por crawlers (no requiere referencia directa).
- `_headers` -> solo para hosts que soportan headers (no aplica en GitHub Pages).
- `lighthouserc.json` -> usado por workflow Lighthouse.
- `lighthouserc.ci.json` -> configuracion alternativa (no usada en workflows actuales).
- `package.json` / `package-lock.json` -> scripts y dependencias.
- `start.bat` / `start.sh` -> arranque manual del dev server.
- `cleanup-workflows.ps1` -> script manual para limpiar ejecuciones de GitHub Actions.

## CSS

- `assets/css/styles.css` -> CSS principal del landing (conectado a `index.html`).
- `assets/css/modules/animations.css` -> utilidades de animacion (conectado a `index.html`).
- `admin/styles.css` -> estilos del admin (`admin/index.html`).

## JS (landing)

- `assets/js/app.js` -> runtime principal (render catalogo/promos/FAQ, navbar, filtros, animaciones basicas).
- `assets/js/boot.js` -> mejora progresiva (scroll narrative, SVG animado, contadores).
- `assets/js/modules/config.js` -> importado por `boot.js`.
- `assets/js/modules/scroll-narrative.js` -> importado por `boot.js`.
- `assets/js/modules/svg-animations.js` -> importado por `boot.js`.

## JS (admin / qr / worker)

- `admin/app.js` -> conectado a `admin/index.html` y al API Worker.
- `qr/qr.js` -> conectado a `qr/index.html`.
- `workers/mahiteklab-api/src/index.js` -> API serverless (Cloudflare Workers).

## Datos

- `assets/data/brand.json` -> cargado por `assets/js/app.js`.
- `data/products.json` -> cargado por `assets/js/app.js`.
- `data/promos.json` -> cargado por `assets/js/app.js`.
- `data/faq.json` -> cargado por `assets/js/app.js`.
- `data/social.json` -> fallback cuando `assets/data/brand.json` no trae `social`.

## Imagenes (assets/img)

- `assets/img/favicon_512.png` -> `index.html` (favicon).
- `assets/img/hero-lab.svg` -> `index.html` (hero).
- `assets/img/hero-lab-epic.svg` -> usado por el Worker para emails (URL en `workers/mahiteklab-api/src/index.js`).
- `assets/img/logo-color.svg` -> `index.html` (logos en secciones).
- `assets/img/mark-icon.svg` -> `assets/js/app.js` (JSON-LD logo).
- `assets/img/og-image.png` -> `index.html` (og:image) y fallback en promos.
- `assets/img/placeholder-catalog.svg` -> placeholders en `index.html` y `assets/js/app.js`.
- `assets/img/placeholder-promos.svg` -> placeholders en `index.html` y `assets/js/app.js`.
- `assets/img/placeholder-faq.svg` -> placeholders en `index.html` y `assets/js/app.js`.
- `assets/img/service-design-v2.svg` -> `index.html`.
- `assets/img/service-packaging-v2.svg` -> `index.html`.
- `assets/img/service-support-v2.svg` -> `index.html`.
- `assets/img/segment-deco.svg` -> `index.html`.
- `assets/img/segment-gift.svg` -> `index.html`.
- `assets/img/segment-fandom-static.svg` -> `index.html`.
- `assets/img/segment-education.svg` -> `index.html`.
- `assets/img/promo-combo-trio-stickers.svg` -> `data/promos.json`.
- `assets/img/promo-combo-pack4-stickers.svg` -> `data/promos.json`.
- `assets/img/promo-combo-pack6-envio.svg` -> `data/promos.json`.
- `assets/img/promo-combo-quinteto-premium.svg` -> `data/promos.json`.
- `assets/img/promo-combo-quetzal.svg` -> `data/promos.json`.
- `assets/img/promo-combo-zombies.svg` -> `data/promos.json`.
- `assets/img/promo-back-to-school.svg` -> `data/promos.json`.
- `assets/img/promo-weekend-trio.svg` -> `data/promos.json`.
- `assets/img/promo-click-pick.svg` -> `data/promos.json`.
- `assets/img/promo-addon-sticker.svg` -> `data/promos.json`.
- `assets/img/promo-club.svg` -> `data/promos.json`.
- `assets/img/promo-envio-online.svg` -> `data/promos.json`.
- `assets/img/promo-pack-stickers-10.svg` -> `data/promos.json`.
- `assets/img/promo-pack-stickers-15.svg` -> `data/promos.json`.
- `assets/img/promo-pack-stickers-25.svg` -> `data/promos.json`.
- `assets/img/promo-pack-key-4.svg` -> `data/promos.json`.
- `assets/img/promo-pack-key-5.svg` -> `data/promos.json`.
- `assets/img/promo-pack-key-6.svg` -> `data/promos.json`.
- `assets/img/promo-pack-key-duo.svg` -> `data/promos.json`.
- `assets/img/promo-pack-key-trio.svg` -> `data/promos.json`.
- `assets/img/promo-pack-quetzal.svg` -> `data/promos.json`.
- `assets/img/promo-pack-zombies.svg` -> `data/promos.json`.
- `assets/img/promo-pack-tux.svg` -> `data/promos.json`.
- `assets/img/promo-stasher-mini.svg` -> `data/promos.json`.
- `assets/img/promo-stasher-duo.svg` -> `data/promos.json`.
- `assets/img/promo-preventa.svg` -> `data/promos.json`.
- `assets/img/promo-referidos.svg` -> `data/promos.json`.
- `assets/img/promo-maker-72h.svg` -> `data/promos.json`.
- `assets/img/promo-key-outlet.svg` -> `data/promos.json`.
- `assets/img/promo-nivel-pro.svg` -> `data/promos.json`.
- `assets/img/promo-figura-med.svg` -> `data/promos.json`.
- `assets/img/promo-figura-duo.svg` -> `data/promos.json`.

## Scripts conectados a npm/CI

- `scripts/build-public.js` -> `npm run build:public` y CI.
- `scripts/validate-encoding.js` -> `npm run validate:encoding`.
- `scripts/validate-docs.js` -> `npm run validate:docs`.
- `scripts/check-analisis-sistema.js` -> llamado por `validate-docs.js`.
- `scripts/generate-analisis-sistema.js` -> `npm run docs:update` y `validate-docs.js`.
- `scripts/validate-html.js` -> `npm run validate:html` y CI.
- `scripts/validate-links.js` -> `npm run validate:links` y CI.
- `scripts/validate-public.js` -> `npm run validate:public:critical`.
- `scripts/generar-lighthouse-badges.js` -> workflow Lighthouse.
- `scripts/monitor.ps1` -> `npm run monitor`.

## Scripts manuales (no llamados por npm/CI)

- `scripts/aplicar-mejoras.ps1`
- `scripts/commit-auto.ps1`
- `scripts/fix-git-windows.ps1`
- `scripts/generar-product-svgs.js`
- `scripts/probar-sonidos.ps1`
- `scripts/run-lighthouse.js`
- `scripts/validar-avanzado.ps1`
- `scripts/validar-codigo.ps1`
- `scripts/validar-manifest-y-recursos.ps1`
- `scripts/validar-todo.ps1`
- `scripts/lib/sonidos.ps1`
- `scripts/README.md`
- `scripts/SONIDOS.md`
- `scripts/SONIDOS_v2.md`
- `scripts/SISTEMA_SONIDOS_RESUMEN.md`

## Documentacion y archivos auxiliares

- `docs/` -> documentacion tecnica (no se carga en runtime).
- `docs/archive/` -> datos y pruebas archivadas.
- `docs/AI_BACKLOG.md` -> backlog de tareas.
- `docs/ARCHITECTURE.md` -> arquitectura general.
- `docs/SISTEMA_DATOS.md`, `docs/UI_COMPONENTS.md`, `docs/SISTEMA_VALIDACION.md`, `docs/VALIDACION_AVANZADA.md`, `docs/SEGURIDAD_INFORME.md` -> documentacion de sistemas.
- `ESTRUCTURA_SECCIONES.md`, `DESARROLLO.md`, `NAVBAR_*.md`, `PERFORMANCE_AUDIT.md`, `PROMOS_COMBOS.md`, `TESTING.md`, `CONFIGURACION_EXTENSIONES.md`, `COMPRESSION.md`, `GITHUB_PAGES_SETUP.md`, `VALIDATION_PROMOS.md` -> documentacion en raiz.

## Archivos generados / no versionables

- `public/` -> salida generada por `scripts/build-public.js` (no versionar).
- `logs/` -> carpeta de logs (gitignored).
