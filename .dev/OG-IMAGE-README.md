# 🎨 Generador de Imagen Open Graph

## ¿Para qué sirve?

Este archivo genera automáticamente una imagen optimizada para previsualizaciones en redes sociales (Facebook, Twitter, WhatsApp, LinkedIn, etc.) cuando compartes el link de tu sitio web.

## 📋 Pasos para usar

### 1. Generar la imagen

1. Abre el archivo `generate-og-image.html` en tu navegador (doble clic)
2. Verás una previsualización de cómo quedará la imagen
3. Haz clic en el botón **"💾 Descargar og-image.png"**
4. Se descargará automáticamente el archivo `og-image.png` (1200x630px)

### 2. Subir al servidor

**Importante:** El archivo `og-image.png` debe estar en la **raíz** de tu sitio web (mismo nivel que `index.html`).

**Estructura correcta:**
```
mahitek3dlab.mx/
├── index.html
├── og-image.png          ← AQUÍ debe estar
├── robots.txt
├── sitemap.xml
└── assets/
    └── ...
```

### 3. Verificar que funciona

Después de subir la imagen, verifica que las previsualizaciones funcionan correctamente:

#### Facebook & LinkedIn
https://developers.facebook.com/tools/debug/
- Pega tu URL: `https://mahitek3dlab.mx/`
- Haz clic en "Depurar" (Debug)
- Verifica que aparezca la imagen correcta

#### Twitter
https://cards-dev.twitter.com/validator
- Pega tu URL: `https://mahitek3dlab.mx/`
- Haz clic en "Preview card"
- Verifica la imagen

#### WhatsApp
https://developers.facebook.com/tools/debug/sharing/
- Similar al de Facebook
- Puedes hacer clic en "Scrape Again" para forzar actualización

## ✅ Meta Tags configurados

Ya están actualizados en tu `index.html`:

```html
<meta property="og:image" content="https://mahitek3dlab.mx/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta name="twitter:image" content="https://mahitek3dlab.mx/og-image.png">
```

## 🔄 Actualizar la imagen

Si quieres cambiar el diseño:

1. Edita el SVG dentro de `generate-og-image.html` (función `getSVGContent()`)
2. Abre el archivo en el navegador
3. Descarga la nueva versión
4. Reemplaza `og-image.png` en tu servidor
5. Limpia la caché en las herramientas de validación

## 📐 Especificaciones técnicas

- **Dimensiones:** 1200x630px (estándar Open Graph)
- **Formato:** PNG con compresión de calidad alta
- **Peso recomendado:** < 1MB
- **Proporción:** 1.91:1
- **Contenido seguro:** Evita texto pequeño (mínimo 20px de altura)

## ⚠️ Importante

- Las redes sociales **no soportan SVG** directamente en Open Graph
- Siempre usa **PNG o JPG** para `og:image`
- Si cambias la imagen, usa las herramientas de validación para forzar actualización
- El cache puede tardar hasta 24-48 horas en actualizar en algunas plataformas

## 🚀 Resultado

Cuando alguien comparta tu link en:
- **Facebook:** Verá una tarjeta con la imagen, título y descripción
- **Twitter:** Card grande con la imagen destacada
- **WhatsApp:** Miniatura de previsualización
- **LinkedIn:** Post enriquecido con imagen
- **Telegram:** Vista previa con imagen

---

**Mahitek 3D Lab** | Impresión 3D en PETG
