function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function getAllowedOrigins(env) {
  const raw = String(env.ALLOWED_ORIGINS || '').trim();
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsify(request, response, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = getAllowedOrigins(env);
  if (!origin || !allowed.includes(origin)) return response;

  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Vary', 'Origin');
  headers.set('Access-Control-Allow-Credentials', 'false');
  headers.set('Access-Control-Allow-Headers', 'content-type, authorization, x-admin-role');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isEmail(value) {
  const s = String(value || '').trim();
  if (s.length < 6 || s.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function nowIso() {
  return new Date().toISOString();
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function toCouponCode(prefix, hex) {
  const core = hex.slice(0, 10).toUpperCase();
  return `${prefix}-${core}`;
}

function getIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    ''
  ).split(',')[0].trim();
}

async function dbEnsure(env) {
  if (!env.DB) throw new Error('DB binding missing (D1)');
  return env.DB;
}

async function dbExec(db, sql, params = []) {
  return db.prepare(sql).bind(...params).run();
}

async function dbFirst(db, sql, params = []) {
  const res = await db.prepare(sql).bind(...params).all();
  return res.results && res.results.length ? res.results[0] : null;
}

async function recordEvent(db, { type, email = null, campaignId = null, ip = null, payload = null }) {
  await dbExec(
    db,
    'INSERT INTO events (type, email, campaign_id, ip, created_at, payload_json) VALUES (?, ?, ?, ?, ?, ?)',
    [type, email, campaignId, ip, nowIso(), payload ? JSON.stringify(payload) : null],
  );
}

function getCampaignIdFromRequest(body) {
  const candidate = String(body.campaignId || '').trim();
  if (!candidate) return null;
  // IDs simples para evitar inyección/ruido
  if (!/^[A-Z0-9_-]{2,32}$/i.test(candidate)) return null;
  return candidate;
}

async function getActiveCampaign(db, id) {
  if (!id) return null;
  const row = await dbFirst(
    db,
    `
      SELECT *
      FROM campaigns
      WHERE id = ?
        AND active = 1
        AND (starts_at IS NULL OR starts_at <= datetime('now'))
        AND (ends_at IS NULL OR ends_at >= datetime('now'))
      LIMIT 1
    `,
    [id],
  );
  return row;
}

async function getWelcomeCampaign(db) {
  const row = await dbFirst(db, 'SELECT * FROM campaigns WHERE id = ? LIMIT 1', ['WELCOME']);
  return row;
}

async function upsertSubscriber(db, request, email, body) {
  const ip = getIp(request);
  const ua = request.headers.get('User-Agent') || '';
  const cf = request.cf || {};
  const referrer = String(body.referrer || request.headers.get('Referer') || '').slice(0, 500);
  const landingPath = String(body.landingPath || '').slice(0, 200);
  const source = String(body.source || '').slice(0, 64);

  await dbExec(
    db,
    `
      INSERT INTO subscribers (email, created_at, source, referrer, landing_path, country, region, city, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        source = COALESCE(excluded.source, subscribers.source),
        referrer = COALESCE(excluded.referrer, subscribers.referrer),
        landing_path = COALESCE(excluded.landing_path, subscribers.landing_path),
        country = COALESCE(excluded.country, subscribers.country),
        region = COALESCE(excluded.region, subscribers.region),
        city = COALESCE(excluded.city, subscribers.city),
        user_agent = COALESCE(excluded.user_agent, subscribers.user_agent)
    `,
    [
      email,
      nowIso(),
      source || null,
      referrer || null,
      landingPath || null,
      cf.country || null,
      cf.region || null,
      cf.city || null,
      ua || null,
    ],
  );

  return { ip, ua };
}

async function issueCoupon(db, env, { email, campaign }) {
  const secret = String(env.COUPON_SECRET || '').trim();
  if (!secret) throw new Error('Missing COUPON_SECRET');

  const msg = `${email}|${campaign.id}`;
  const hex = await hmacSha256Hex(secret, msg);
  const code = toCouponCode(campaign.prefix, hex);

  await dbExec(
    db,
    'INSERT OR IGNORE INTO coupons (code, email, campaign_id, created_at) VALUES (?, ?, ?, ?)',
    [code, email, campaign.id, nowIso()],
  );

  const row = await dbFirst(
    db,
    'SELECT code, campaign_id AS campaignId, created_at AS createdAt, redeemed_at AS redeemedAt FROM coupons WHERE email = ? AND campaign_id = ? LIMIT 1',
    [email, campaign.id],
  );

  return row;
}

async function verifyTurnstile(env, token, ip) {
  const secret = String(env.TURNSTILE_SECRET || '').trim();
  if (!secret) {
    // Modo sin Turnstile (dev/MVP). Recomendado configurar el secret en producción.
    return { ok: true, skipped: true };
  }
  if (!token) return { ok: false, error: 'missing_turnstile_token' };

  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (data && data.success) return { ok: true, data };
  return { ok: false, error: 'turnstile_failed', data };
}

async function sendEmail(env, { to, subject, html }) {
  const provider = String(env.EMAIL_PROVIDER || '').trim().toLowerCase();
  if (!provider) return { ok: false, error: 'missing_email_provider' };

  if (provider === 'brevo') {
    const apiKey = String(env.BREVO_API_KEY || '').trim();
    const fromEmail = String(env.EMAIL_FROM || '').trim();
    const fromName = String(env.EMAIL_FROM_NAME || 'Mahitek 3D Lab').trim();
    if (!apiKey || !fromEmail) return { ok: false, error: 'missing_brevo_config' };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => '');
    return { ok: false, error: 'brevo_send_failed', details: text.slice(0, 800) };
  }

  if (provider === 'resend') {
    const apiKey = String(env.RESEND_API_KEY || '').trim();
    const from = String(env.EMAIL_FROM || '').trim();
    if (!apiKey || !from) return { ok: false, error: 'missing_resend_config' };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => '');
    return { ok: false, error: 'resend_send_failed', details: text.slice(0, 800) };
  }

  return { ok: false, error: `unsupported_email_provider:${provider}` };
}

function renderCouponEmail({ landingUrl, welcome, campaign }) {
  const lines = [];
  lines.push(`<p>Gracias por suscribirte a <strong>Mahitek 3D Lab</strong>.</p>`);
  lines.push(`<p>Tu cupón de bienvenida:</p>`);
  lines.push(`<p style="font-size:18px"><strong>${welcome.code}</strong></p>`);

  if (campaign) {
    lines.push(`<p>Tu cupón de campaña:</p>`);
    lines.push(`<p style="font-size:18px"><strong>${campaign.code}</strong></p>`);
    lines.push(`<p><small>Se pueden usar juntos: <strong>WELCOME + campaña</strong> (máximo 2 cupones).</small></p>`);
  }

  lines.push(
    `<p><small>Si no solicitaste esto, ignora este correo.</small></p>`,
  );
  if (landingUrl) lines.push(`<p><a href="${landingUrl}">Volver al sitio</a></p>`);

  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5">${lines.join(
    '',
  )}</body></html>`;
}

function parseAdminTokens(env) {
  try {
    const raw = String(env.ADMIN_ROLE_TOKENS_JSON || '').trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function requireAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m ? m[1].trim() : '';
  const role = String(request.headers.get('X-Admin-Role') || 'general').trim().toLowerCase();

  const tokens = parseAdminTokens(env);
  const expected = String(tokens[role] || '').trim();
  if (!expected || token !== expected) {
    return { ok: false, role };
  }
  return { ok: true, role };
}

async function handleSubscribe(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'invalid_json' }, { status: 400 });

  const email = String(body.email || '').trim().toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: 'invalid_email' }, { status: 400 });

  const db = await dbEnsure(env);
  const ip = getIp(request);

  const turnstile = await verifyTurnstile(env, body.turnstileToken, ip);
  if (!turnstile.ok) return json({ ok: false, error: turnstile.error }, { status: 400 });

  const { ua } = await upsertSubscriber(db, request, email, body);
  await recordEvent(db, { type: 'subscribe', email, ip, payload: { ua } });

  const welcomeCampaign = await getWelcomeCampaign(db);
  if (!welcomeCampaign) return json({ ok: false, error: 'missing_welcome_campaign' }, { status: 500 });

  const requestedCampaignId = getCampaignIdFromRequest(body);
  const campaign = requestedCampaignId ? await getActiveCampaign(db, requestedCampaignId) : null;

  const welcomeCoupon = await issueCoupon(db, env, { email, campaign: welcomeCampaign });
  let campaignCoupon = null;
  if (campaign && campaign.id !== 'WELCOME') {
    campaignCoupon = await issueCoupon(db, env, { email, campaign });
  }

  await recordEvent(db, {
    type: 'coupon_issued',
    email,
    campaignId: campaign ? campaign.id : 'WELCOME',
    ip,
    payload: { welcome: Boolean(welcomeCoupon), campaign: Boolean(campaignCoupon) },
  });

  const landingUrl = String(env.PUBLIC_LANDING_URL || '').trim();
  const html = renderCouponEmail({ landingUrl, welcome: welcomeCoupon, campaign: campaignCoupon });
  const subject = campaignCoupon
    ? 'Tus cupones de Mahitek 3D Lab (bienvenida + campaña)'
    : 'Tu cupón de bienvenida — Mahitek 3D Lab';

  const emailResult = await sendEmail(env, { to: email, subject, html });
  return json({ ok: true, emailSent: emailResult.ok });
}

async function handleAdminCampaigns(request, env) {
  const db = await dbEnsure(env);
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ ok: false, error: 'unauthorized' }, { status: 401 });

  if (request.method === 'GET') {
    const res = await db
      .prepare(
        'SELECT id, name, prefix, discount_type AS discountType, discount_value AS discountValue, stackable, stack_group AS stackGroup, active, starts_at AS startsAt, ends_at AS endsAt, created_at AS createdAt, updated_at AS updatedAt FROM campaigns ORDER BY id ASC',
      )
      .all();
    return json({ ok: true, campaigns: res.results || [] });
  }

  if (request.method === 'POST') {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return json({ ok: false, error: 'invalid_json' }, { status: 400 });

    const id = String(body.id || '').trim();
    const name = String(body.name || '').trim();
    const prefix = String(body.prefix || '').trim().toUpperCase();
    const discountType = String(body.discountType || '').trim();
    const discountValue = Number(body.discountValue);

    if (!/^[A-Z0-9_-]{2,32}$/.test(id)) return json({ ok: false, error: 'invalid_id' }, { status: 400 });
    if (!name || name.length > 80) return json({ ok: false, error: 'invalid_name' }, { status: 400 });
    if (!/^[A-Z0-9]{2,12}$/.test(prefix)) return json({ ok: false, error: 'invalid_prefix' }, { status: 400 });
    if (!['percent', 'amount'].includes(discountType))
      return json({ ok: false, error: 'invalid_discount_type' }, { status: 400 });
    if (!Number.isFinite(discountValue) || discountValue <= 0)
      return json({ ok: false, error: 'invalid_discount_value' }, { status: 400 });

    const stackable = body.stackable ? 1 : 0;
    const stackGroup = String(body.stackGroup || '').trim() || null;
    const active = body.active === false ? 0 : 1;
    const startsAt = body.startsAt ? String(body.startsAt) : null;
    const endsAt = body.endsAt ? String(body.endsAt) : null;

    const ts = nowIso();
    await dbExec(
      db,
      `
        INSERT INTO campaigns (id, name, prefix, discount_type, discount_value, stackable, stack_group, active, starts_at, ends_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          prefix = excluded.prefix,
          discount_type = excluded.discount_type,
          discount_value = excluded.discount_value,
          stackable = excluded.stackable,
          stack_group = excluded.stack_group,
          active = excluded.active,
          starts_at = excluded.starts_at,
          ends_at = excluded.ends_at,
          updated_at = excluded.updated_at
      `,
      [
        id,
        name,
        prefix,
        discountType,
        Math.floor(discountValue),
        stackable,
        stackGroup,
        active,
        startsAt,
        endsAt,
        ts,
        ts,
      ],
    );

    await recordEvent(db, {
      type: 'admin_action',
      ip: getIp(request),
      payload: { action: 'upsert_campaign', role: auth.role, id },
    });

    return json({ ok: true });
  }

  return json({ ok: false, error: 'method' }, { status: 405 });
}

async function handleAdminStats(request, env) {
  const db = await dbEnsure(env);
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const subs = await dbFirst(db, 'SELECT COUNT(*) AS n FROM subscribers', []);
  const coupons = await dbFirst(db, 'SELECT COUNT(*) AS n FROM coupons', []);
  const campaigns = await dbFirst(db, 'SELECT COUNT(*) AS n FROM campaigns WHERE active = 1', []);
  return json({
    ok: true,
    stats: {
      subscribers: subs ? subs.n : 0,
      coupons: coupons ? coupons.n : 0,
      activeCampaigns: campaigns ? campaigns.n : 0,
    },
  });
}

export default {
  async fetch(request, env) {
    try {
      if (request.method === 'OPTIONS') {
        return corsify(request, new Response(null, { status: 204 }), env);
      }

      const url = new URL(request.url);
      const path = url.pathname;

      if (request.method === 'GET' && path === '/health') {
        return corsify(request, json({ ok: true, name: 'mahiteklab-api' }), env);
      }

      if (path === '/subscribe' && request.method === 'POST') {
        return corsify(request, await handleSubscribe(request, env), env);
      }

      if (path === '/admin/campaigns') {
        return corsify(request, await handleAdminCampaigns(request, env), env);
      }

      if (path === '/admin/stats' && request.method === 'GET') {
        return corsify(request, await handleAdminStats(request, env), env);
      }

      return corsify(request, json({ ok: false, error: 'not_found' }, { status: 404 }), env);
    } catch (err) {
      return corsify(
        request,
        json({ ok: false, error: 'server_error' }, { status: 500 }),
        env,
      );
    }
  },
};
