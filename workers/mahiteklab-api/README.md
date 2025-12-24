# `mahiteklab-api` (Cloudflare Workers)

API serverless para:
- Suscripcion + cupones (`BIENVENIDA` + campana) con envio por correo.
- Admin básico de campañas (MVP) vía endpoints.

## Deploy rápido (resumen)

1) Instala Wrangler:

`npm i -g wrangler`

2) Entra al directorio:

`cd workers/mahiteklab-api`

3) Crea D1:

`wrangler d1 create mahiteklab-db`

4) Pega el `database_id` en `wrangler.toml`.

5) Aplica migración:

`wrangler d1 execute mahiteklab-db --file migrations/0001_init.sql`

6) Configura secrets (mínimo):

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

Se permite solo:
- `https://mahitek3dlab.com`
- `https://www.mahitek3dlab.com`
- `https://dtcsrni.github.io` (redirecci¢n)
- `https://mahiteklab-admin.pages.dev`

Configurable en `ALLOWED_ORIGINS`.
