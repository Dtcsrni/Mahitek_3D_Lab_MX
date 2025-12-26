# mahiteklab-api (Cloudflare Workers)

API serverless para:
- Suscripcion y cupones (BIENVENIDA + campanas).
- Admin basico de campanas via endpoints.

## Deploy rapido (resumen)

1) Instala Wrangler:

`npm i -g wrangler`

2) Entra al directorio:

`cd workers/mahiteklab-api`

3) Crea D1:

`wrangler d1 create mahiteklab-db`

4) Pega el `database_id` en `wrangler.toml`.

5) Aplica migracion:

`wrangler d1 execute mahiteklab-db --file migrations/0001_init.sql`

6) Configura secrets (minimo):

- `wrangler secret put COUPON_SECRET`
- `wrangler secret put TURNSTILE_SECRET` (recomendado)
- Email (elige proveedor):
  - Brevo: `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`
  - Resend: `RESEND_API_KEY`, `EMAIL_FROM`

7) Tokens admin (MVP):

Edita `ADMIN_ROLE_TOKENS_JSON` en `wrangler.toml` o usa `wrangler secret put ADMIN_ROLE_TOKENS_JSON`.

8) Deploy:

`wrangler deploy`

## CORS

Se controla con `ALLOWED_ORIGINS` (lista separada por comas). Ejemplo prod:
- `https://mahitek3dlab.com`
- `https://www.mahitek3dlab.com`
- `https://dtcsrni.github.io`
- `https://mahiteklab-admin.pages.dev`

## Dev local

`wrangler dev --env dev` habilita `http://localhost:8080` y `http://127.0.0.1:8080`.

## Conexiones en el repo

- `assets/js/app.js` usa `NEWSLETTER_API_BASE`.
- `admin/app.js` usa `DEFAULT_API_BASE`.
