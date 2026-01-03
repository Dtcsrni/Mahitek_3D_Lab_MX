# mahiteklab-admin (Cloudflare Pages)

Panel estático para administrar campañas y ver métricas del Worker `mahiteklab-api`.

## Deploy (Cloudflare Pages)

- Project name: `mahiteklab-admin`
- Build command: (vacío)
- Output directory: `admin`

## Uso

- Abre `admin/index.html`.
- Ingresa role y token (configurados en el Worker).
- Ajusta `API Base` si usas un entorno distinto.

## Seguridad (MVP)

- El panel esta pensado para ser publico pero restringido.
- Recomendado: Cloudflare Access (allowlist de correos + 2FA).
- Tokens por rol: `ADMIN_ROLE_TOKENS_JSON` en el Worker.
