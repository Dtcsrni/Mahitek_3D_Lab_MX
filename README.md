# Mahitek 3D Lab · Landing QR-first

Landing estática optimizada para tráfico desde QR, redes sociales y búsqueda directa. Incluye narrativa prescrita, catálogo dinámico, experimentos controlados y métricas ligeras.

## Estructura principal

```
/index.html
/assets/css/styles.css
/assets/js/app.js
/assets/img/
/data/products.json
/data/promos.json
/data/social.json
/data/faq.json
/data/experiments.json
sitemap.xml
robots.txt
```

## Contenido editable

### Catálogo (`/data/products.json`)
- Cada producto requiere `id`, `nombre`, `categoria`, `precio_mxn`, `imagen`, `material`, `coda`, `historia`, `estado` y `tags`.
- Solo se muestran elementos con `"estado": "activo"`.
- Añade `variantes` opcional y suma etiquetas que ayuden a la búsqueda.

### Promociones (`/data/promos.json`)
- Estructura mínima: `id`, `titulo`, `mensaje`, `desde`, `hasta`, `cta_text`, `cta_url`.
- El texto de WhatsApp (`text=`) se extrae automáticamente para generar CTAs con UTM consistentes.
- Con `?promo=ID` en la URL se abre el drawer de promos.

### Redes (`/data/social.json`)
- Define enlaces a Instagram, Facebook y TikTok. Se actualizan en comunidad, footer y esquema JSON-LD.

### FAQ (`/data/faq.json`)
- Lista de objetos con `q` y `a`. El acordeón es accesible y respeta `prefers-reduced-motion`.

### Experimentos (`/data/experiments.json`)
- Configura pruebas A/B. Campos clave:
  - `enabled`: activar/desactivar todos los tests.
  - `bucket_mode`: actualmente `50_50`.
  - `tests`: cada test define variantes `A` y `B`. Usa `variant: "auto"` para repartir visitantes.
- Variantes disponibles por defecto:
  - `hero_copy` (título/subtítulo del hero)
  - `cta_primary` (`catalogo` o `whatsapp`)
  - `qr_banner_copy` (mensaje del banner QR)
  - `product_grid_layout` (`grid-3` o `grid-2`)
  - `promo_drawer_default` (true/false)
- Forzar una variante: añade `?force_exp=hero_copy:B`. Para pausar todo: `?exp=off`.
- Asignaciones por visitante se guardan en `localStorage` (`mahitek_exp_bucket_v1`).

## Comportamiento QR-first

- Detecta `src=qr` o `utm_source=sticker|lona|flyer` y muestra banner de bienvenida por 8 segundos.
- Persiste parámetros en `localStorage` (`mahitek_ctx_v1`) para reutilizarlos en CTAs.
- CTA de WhatsApp ajusta el mensaje según contexto (general, QR, B2B o producto).

## Analítica y eventos

`window.dataLayer` recopila:
- `qr_entry` `{src, utm}` al mostrar el banner.
- `catalog_view` `{count}` cuando se cargan productos.
- `product_view` `{id}` al entrar en viewport.
- `cta_click` `{id, target}` en cada CTA etiquetado.
- `whatsapp_click` `{params}` en enlaces a WhatsApp.
- `exp_assign`, `exp_impression`, `exp_conversion` para experimentos activos.

## Accesibilidad y rendimiento

- Semántica con `<header>`, `<main>`, `<section>`, `<nav>` y `<footer>`.
- Animaciones controladas por `IntersectionObserver`, desactivadas con `prefers-reduced-motion`.
- Imágenes SVG livianas con `loading="lazy"` donde aplica.
- Meta OG/Twitter + JSON-LD para organización y productos.
- `robots.txt` y `sitemap.xml` listos para GitHub Pages.

## Despliegue

1. Haz commit y push en `main`.
2. Activa GitHub Pages en **Settings → Pages** apuntando a la rama `main` carpeta raíz.
3. Verifica métricas con Lighthouse (objetivo ≥ 90 en Performance, Accessibility y SEO).

## Actualizar el logo

- Logo principal: `/assets/img/logo-color.svg`.
- Variante monocroma: `/assets/img/logo-mono.svg`.
- Sustituye estos archivos si recibes una versión oficial distinta.

## Desarrollo local

No requiere build. Basta con servir la carpeta (ejemplo: `npx serve .`).

- Edita los JSON y refresca el navegador.
- Usa `?force_exp=` para validar variantes.
- Asegúrate de mantener la narrativa obligatoria indicada en `index.html`.
