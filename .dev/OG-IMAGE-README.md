# 🎨 Generador de Imagen Open Graph

## ¿Para qué sirve?

Este archivo genera automáticamente una imagen optimizada para previsualizaciones en redes sociales (Facebook, Twitter, WhatsApp, LinkedIn, etc.) cuando compartes el link de tu sitio web.

## 📋 Pasos para usar

### 1. Generar la imagen

1. Abre `/.dev/og-image-generator.html` en tu navegador
   - Recomendado: ejecuta `npm run dev` y visita `http://localhost:8080/.dev/og-image-generator.html`
2. Verás una previsualización de cómo quedará la imagen
3. Haz clic en el botón **"💾 Descargar og-image.png"**
4. Se descargará automáticamente el archivo `og-image.png` (1200x630px)

### 2. Subir al servidor

**Importante:** En este repo el sitio usa `assets/img/og-image.png` (no la raíz).

**Estructura correcta:**
```
Mahitek_3D_Lab_MX/
├── index.html
├── robots.txt
├── sitemap.xml
└── assets/
    └── img/
        └── og-image.png  ← AQUÍ debe estar
```

### 3. Verificar que funciona

Después de subir la imagen, verifica que las previsualizaciones funcionan correctamente:

#### Facebook & LinkedIn
https://developers.facebook.com/tools/debug/
- Pega tu URL: `https://dtcsrni.github.io/Mahitek_3D_Lab_MX/`
- Haz clic en "Depurar" (Debug)
- Verifica que aparezca la imagen correcta

#### Twitter
https://cards-dev.twitter.com/validator
- Pega tu URL: `https://dtcsrni.github.io/Mahitek_3D_Lab_MX/`
- Haz clic en "Preview card"
- Verifica la imagen

#### WhatsApp
https://developers.facebook.com/tools/debug/sharing/
- Similar al de Facebook
- Puedes hacer clic en "Scrape Again" para forzar actualización

## ✅ Meta Tags configurados

Ya están actualizados en tu `index.html`:

```html
<meta property="og:image" content="https://dtcsrni.github.io/Mahitek_3D_Lab_MX/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta name="twitter:image" content="https://dtcsrni.github.io/Mahitek_3D_Lab_MX/assets/img/og-image.png">
```

## 🔄 Actualizar la imagen

Si quieres cambiar el diseño:

1. Edita `.dev/og-image.svg` (fuente)
2. Abre `/.dev/og-image-generator.html` en el navegador
3. Descarga la nueva versión como `og-image.png`
4. Reemplaza `assets/img/og-image.png` en el repo
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
