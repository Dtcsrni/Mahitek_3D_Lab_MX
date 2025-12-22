# QR Redirect (GitHub Pages)

Este directorio contiene un `index.html` minimalista para redirección con UTM y GA4.

Instrucciones:
1) Usa Measurement ID real en las dos apariciones de `G-XXXXXXXXXX`.
2) Publica como repositorio aparte (recomendado):
   - Crea repo `qr` en tu cuenta.
   - Copia este `index.html` a la raíz del repo.
   - Settings → Pages → Branch: `main` y carpeta `/`.
   - URL pública esperada: `https://mahitek3dlab.com/qr/`
3) Parámetros opcionales en la URL del QR:
   - `?c=<campaign>` para campaign
   - `?m=<medium>` para medium (default `print`)
   - `?s=<source>` para source (default `qr`)

El script enviará un evento `qr_redirect` a GA4 y luego redirigirá a:
`https://mahitek3dlab.com/?utm_source=<s>&utm_medium=<m>&utm_campaign=<c>`
