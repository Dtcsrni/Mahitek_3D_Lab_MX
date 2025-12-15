# AI Backlog (agent-ready)

## Estado

- ✅ AI-001 (UTF‑8 / textos corruptos)
- ✅ AI-002 (SEO: sitemap/robots)
- ✅ AI-003 (README: badges + scripts reales)
- ✅ AI-004 (Git Windows: script de reparación)
- ✅ AI-006 (promos.js sin referencias rotas)
- ✅ AI-007 (deploy hygiene: `public/` + Pages)
- ⏳ AI-005 (arquitectura: reducir duplicación runtime)
- ✅ AI-008 (CSP/_headers: alineado + sin scripts inline)

Formato de ticket recomendado:

- **ID / Título**
- **Contexto**
- **Cambios esperados**
- **Archivos probables**
- **Comandos de verificación**
- **Criterios de aceptación**

---

## AI-001 — Normalizar encoding UTF‑8 (UI sin “V¿lido/Categor¿a/preparaci¿n”)

**Contexto**
- Hay strings en `assets/js/app.js` y `assets/js/boot.js` con caracteres corruptos por encoding.
- Impacta UX y confianza (textos visibles como “V¿lido”, “Categor¿a”, “preparaci¿n”).

**Cambios esperados**
- Reemplazar textos corruptos por español correcto.
- Guardar archivos en UTF‑8.

**Archivos probables**
- `assets/js/app.js`
- `assets/js/boot.js`

**Comandos de verificación**
- `npm run validate`
- Smoke test manual: abrir `index.html` y verificar placeholders/labels.

**Criterios de aceptación**
- No aparecen “¿” basura dentro de palabras en la UI.

---

## AI-002 — SEO: corregir `sitemap.xml` y `robots.txt` al dominio real

**Contexto**
- `sitemap.xml` y `robots.txt` apuntan a un dominio distinto al usado en `index.html` (OG URL).

**Cambios esperados**
- Alinear URLs a `https://dtcsrni.github.io/Mahitek_3D_Lab_MX/`.

**Archivos probables**
- `sitemap.xml`
- `robots.txt`

**Comandos de verificación**
- `npm run validate`

**Criterios de aceptación**
- `robots.txt` referencia el sitemap correcto.
- `sitemap.xml` contiene la URL real.

---

## AI-003 — README: arreglar badges Lighthouse y alinear “Testing”

**Contexto**
- Badges Lighthouse usan un query mal escrito (`endpointúurl`) y el README describe scripts que no existen.

**Cambios esperados**
- Corregir URLs de badges.
- Alinear comandos con `package.json` (`npm run validate`, `npm run dev`, etc.).

**Archivos probables**
- `README.md`

**Comandos de verificación**
- `npm run validate`

**Criterios de aceptación**
- README sin typos en badges y con comandos reales.

---

## AI-004 — Git hygiene Windows: evitar corrupción por `desktop.ini` + `reftable`

**Contexto**
- En Windows puede aparecer `desktop.ini` dentro de `.git`, rompiendo refs (especialmente con `reftable`).

**Cambios esperados**
- Documentar el fix en `AGENTS.md`.
- (Opcional) agregar `scripts/fix-git-windows.ps1` con pasos seguros.

**Archivos probables**
- `AGENTS.md`
- `scripts/fix-git-windows.ps1` (nuevo, opcional)

**Comandos de verificación**
- `git fsck --full`

**Criterios de aceptación**
- Instrucciones claras y reproducibles para recuperar el repo.

---

## AI-005 — Reducir duplicación: definir fuente de verdad (config/datos)

**Contexto**
- Hay dos arquitecturas JS en paralelo: `assets/js/app.js` (legacy) y `assets/js/boot.js` + módulos.
- Existe config duplicada y cargas duplicadas.

**Cambios esperados**
- Elegir una dirección:
  - A) “app.js manda”: minimizar módulos a lo estrictamente necesario, o
  - B) “migración a módulos”: extraer piezas de `app.js` gradualmente.
- Documentar la decisión y el primer paso.

**Archivos probables**
- `docs/ARCHITECTURE.md` (nuevo)
- `assets/js/app.js`
- `assets/js/boot.js`
- `assets/js/modules/*`

**Comandos de verificación**
- `npm run validate`

**Criterios de aceptación**
- Decisión documentada y cambios mínimos aplicados sin romper UI.

---

## AI-006 — Deuda técnica: `assets/js/promos.js` incompleto

**Contexto**
- Contiene referencias a variables no definidas (`resolved`, `STICKER_PROMO_ICONS`).

**Cambios esperados**
- O corregirlo y conectarlo a una página real, o removerlo si no se usa.

**Archivos probables**
- `assets/js/promos.js`
- (Opcional) `index.html` / docs

**Comandos de verificación**
- `npm run validate`

**Criterios de aceptación**
- No hay módulos “rotos” en el repo.

---

## AI-007 — Deploy hygiene: no publicar todo el repo en Pages

**Contexto**
- El workflow sube `path: '.'`, lo que expone archivos internos (scripts/tests/docs).

**Cambios esperados**
- Definir `public/` como raíz publicada y mover/copiar solo lo necesario.
- Ajustar `.github/workflows/ci.yml` a `path: public`.

**Archivos probables**
- `.github/workflows/ci.yml`
- `public/` (nuevo)
- Ajustes de rutas si aplica

**Comandos de verificación**
- `npm run validate`

**Criterios de aceptación**
- Pages solo publica el sitio, no herramientas internas.

---

## AI-008 — CSP/_headers: decidir si se mantiene o se elimina

**Contexto**
- `_headers` no aplica a GitHub Pages y además no coincide con recursos reales (GA inline, Formspree).

**Cambios esperados**
- O eliminar `_headers`, o reescribirlo para hosts que sí lo respeten.

**Archivos probables**
- `_headers`
- `README.md` o `docs/*` (nota)

**Comandos de verificación**
- `npm run validate`

**Criterios de aceptación**
- No hay configuración “falsa” o contradictoria.
