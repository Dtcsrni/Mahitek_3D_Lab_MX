# QR Redirect (GitHub Pages)

Landing minima para redireccion con UTM y GA4.

## Ajustes necesarios

- `qr/qr.js`: actualiza `CONFIG.gaMeasurementId` y `CONFIG.baseUrl`.

## Deploy (opciones)

Opcion A: Mantener dentro de este repo
- El build `scripts/build-public.js` copia `qr/` a `public/`.
- La ruta final queda como `https://mahitek3dlab.com/qr/`.

Opcion B: Publicar como repo aparte
- Crea un repo `qr`.
- Copia `qr/index.html` y `qr/qr.js` a la raiz del repo.
- En Settings -> Pages, selecciona `main` y carpeta `/`.

## Parametros de URL

- `?c=<campaign>` para campaign
- `?m=<medium>` para medium (default `print`)
- `?s=<source>` para source (default `qr`)

Redirige a:
`<baseUrl>?utm_source=<s>&utm_medium=<m>&utm_campaign=<c>`
