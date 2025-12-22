# `mahiteklab-admin` (Cloudflare Pages)

Panel estático para administrar campañas y ver métricas del Worker `mahiteklab-api`.

## Deploy (Cloudflare Pages)

- **Project name:** `mahiteklab-admin`
- **Build command:** (vacío)
- **Output directory:** `admin`

## Seguridad (MVP)

- El panel está pensado para ser **público pero restringido**.
- Recomendado: activar **Cloudflare Access** (allowlist de correos + 2FA).
- Los tokens por rol se configuran en el Worker (`ADMIN_ROLE_TOKENS_JSON`).
