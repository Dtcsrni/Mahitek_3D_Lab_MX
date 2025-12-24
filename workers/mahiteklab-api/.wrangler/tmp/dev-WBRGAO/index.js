var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}
__name(json, "json");
var BIENVENIDA_CAMPAIGN_ID = "BIENVENIDA";
function getAllowedOrigins(env) {
  const raw = String(env.ALLOWED_ORIGINS || "").trim();
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
__name(getAllowedOrigins, "getAllowedOrigins");
function corsify(request, response, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = getAllowedOrigins(env);
  if (!origin || !allowed.includes(origin)) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Credentials", "false");
  headers.set("Access-Control-Allow-Headers", "content-type, authorization, x-admin-role");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
__name(corsify, "corsify");
function isEmail(value) {
  const s = String(value || "").trim();
  if (s.length < 6 || s.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
__name(isEmail, "isEmail");
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso, "nowIso");
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256Hex, "hmacSha256Hex");
function toCouponCode(prefix, hex) {
  const core = hex.slice(0, 10).toUpperCase();
  return `${prefix}-${core}`;
}
__name(toCouponCode, "toCouponCode");
function getIp(request) {
  return (request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "").split(",")[0].trim();
}
__name(getIp, "getIp");
async function dbEnsure(env) {
  if (!env.DB) throw new Error("DB binding missing (D1)");
  return env.DB;
}
__name(dbEnsure, "dbEnsure");
async function dbExec(db, sql, params = []) {
  return db.prepare(sql).bind(...params).run();
}
__name(dbExec, "dbExec");
async function dbFirst(db, sql, params = []) {
  const res = await db.prepare(sql).bind(...params).all();
  return res.results && res.results.length ? res.results[0] : null;
}
__name(dbFirst, "dbFirst");
async function recordEvent(db, { type, email = null, campaignId = null, ip = null, payload = null }) {
  await dbExec(
    db,
    "INSERT INTO events (type, email, campaign_id, ip, created_at, payload_json) VALUES (?, ?, ?, ?, ?, ?)",
    [type, email, campaignId, ip, nowIso(), payload ? JSON.stringify(payload) : null]
  );
}
__name(recordEvent, "recordEvent");
function getCampaignIdFromRequest(body) {
  const candidate = String(body.campaignId || "").trim();
  if (!candidate) return null;
  if (!/^[A-Z0-9_-]{2,32}$/i.test(candidate)) return null;
  return candidate;
}
__name(getCampaignIdFromRequest, "getCampaignIdFromRequest");
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
    [id]
  );
  return row;
}
__name(getActiveCampaign, "getActiveCampaign");
async function getWelcomeCampaign(db) {
  const row = await dbFirst(
    db,
    "SELECT * FROM campaigns WHERE id = ? LIMIT 1",
    [BIENVENIDA_CAMPAIGN_ID]
  );
  return row;
}
__name(getWelcomeCampaign, "getWelcomeCampaign");
async function upsertSubscriber(db, request, email, body) {
  const ip = getIp(request);
  const ua = request.headers.get("User-Agent") || "";
  const cf = request.cf || {};
  const referrer = String(body.referrer || request.headers.get("Referer") || "").slice(0, 500);
  const landingPath = String(body.landingPath || "").slice(0, 200);
  const source = String(body.source || "").slice(0, 64);
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
      ua || null
    ]
  );
  return { ip, ua };
}
__name(upsertSubscriber, "upsertSubscriber");
async function issueCoupon(db, env, { email, campaign }) {
  const secret = String(env.COUPON_SECRET || "").trim();
  if (!secret) throw new Error("Missing COUPON_SECRET");
  const msg = `${email}|${campaign.id}`;
  const hex = await hmacSha256Hex(secret, msg);
  const code = toCouponCode(campaign.prefix, hex);
  await dbExec(
    db,
    "INSERT OR IGNORE INTO coupons (code, email, campaign_id, created_at) VALUES (?, ?, ?, ?)",
    [code, email, campaign.id, nowIso()]
  );
  const row = await dbFirst(
    db,
    "SELECT code, campaign_id AS campaignId, created_at AS createdAt, redeemed_at AS redeemedAt FROM coupons WHERE email = ? AND campaign_id = ? LIMIT 1",
    [email, campaign.id]
  );
  return row;
}
__name(issueCoupon, "issueCoupon");
async function verifyTurnstile(env, token, ip) {
  const secret = String(env.TURNSTILE_SECRET || "").trim();
  if (!secret) {
    return { ok: true, skipped: true };
  }
  if (!token) return { ok: false, error: "missing_turnstile_token" };
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (data && data.success) return { ok: true, data };
  return { ok: false, error: "turnstile_failed", data };
}
__name(verifyTurnstile, "verifyTurnstile");
async function sendEmail(env, { to, subject, html }) {
  const provider = String(env.EMAIL_PROVIDER || "").trim().toLowerCase();
  if (!provider) return { ok: false, error: "missing_email_provider" };
  if (provider === "brevo") {
    const apiKey = String(env.BREVO_API_KEY || "").trim();
    const fromEmail = String(env.EMAIL_FROM || "").trim();
    const fromName = String(env.EMAIL_FROM_NAME || "Mahitek 3D Lab").trim();
    if (!apiKey || !fromEmail) return { ok: false, error: "missing_brevo_config" };
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html
      })
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => "");
    return { ok: false, error: "brevo_send_failed", details: text.slice(0, 800) };
  }
  if (provider === "resend") {
    const apiKey = String(env.RESEND_API_KEY || "").trim();
    const from = String(env.EMAIL_FROM || "").trim();
    if (!apiKey || !from) return { ok: false, error: "missing_resend_config" };
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ from, to: [to], subject, html })
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => "");
    return { ok: false, error: "resend_send_failed", details: text.slice(0, 800) };
  }
  return { ok: false, error: `unsupported_email_provider:${provider}` };
}
__name(sendEmail, "sendEmail");
function renderCouponEmail({ landingUrl, welcome, campaign }) {
  const brand = {
    teal: "#0ea5a3",
    tealDeep: "#0b6b6a",
    blue: "#1d9bf0",
    red: "#ef4444",
    ink: "#0b0f12",
    inkSoft: "#111827",
    text: "#e5e7eb",
    muted: "#a7b0c2",
    panel: "#0f172a",
    panelSoft: "#111827",
    line: "#1f2937"
  };
  const title = campaign ? "Tus cupones de bienvenida y campana estan listos" : "Tu cupon de bienvenida esta listo";
  const subtitle = campaign ? "Gracias por registrarte. Usa tu bienvenida y aprovecha el extra de campana." : "Gracias por registrarte. Aqui tienes tu beneficio de bienvenida.";
  const preheader = campaign ? "Tus cupones de bienvenida y campana estan listos." : "Bienvenida a Mahitek 3D Lab. Tu cupon ya esta listo.";
  const couponBlock = /* @__PURE__ */ __name((label, code, accent) => `
    <div class="mail-coupon mail-anim" style="background:${brand.panel};border:1px solid ${accent};border-radius:16px;padding:18px;margin:14px 0;">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${brand.muted};margin-bottom:6px;">
        ${label}
      </div>
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.1em;">
        ${code}
      </div>
    </div>
  `, "couponBlock");
  const stackNote = campaign ? `<div style="font-size:13px;color:${brand.muted};margin-top:8px;">
         Puedes combinar <strong>Bienvenida + campana</strong> en la misma compra (max. 2 cupones).
       </div>` : "";
  const button = landingUrl ? `<a class="mail-btn mail-anim" href="${landingUrl}" style="display:inline-block;background:${brand.blue};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:12px;">
         Ir al sitio
       </a>` : "";
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Mahitek 3D Lab</title>
      <style>
        @media (prefers-reduced-motion: reduce) {
          .mail-anim { animation: none !important; }
        }
        @keyframes mailFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        @keyframes mailPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(14, 165, 163, 0); }
          50% { box-shadow: 0 0 18px rgba(14, 165, 163, 0.35); }
        }
        @keyframes mailCTA {
          0%, 100% { box-shadow: 0 0 0 rgba(29, 155, 240, 0); }
          50% { box-shadow: 0 0 16px rgba(29, 155, 240, 0.45); }
        }
        .mail-hero { animation: mailFloat 7s ease-in-out infinite; }
        .mail-coupon { animation: mailPulse 5s ease-in-out infinite; }
        .mail-btn { animation: mailCTA 4s ease-in-out infinite; }
      </style>
    </head>
    <body style="margin:0;background:${brand.ink};font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;">
      <div style="max-width:640px;margin:0 auto;padding:28px 18px 36px;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${preheader}
        </div>

        <div class="mail-hero mail-anim" style="background:linear-gradient(135deg,${brand.teal},${brand.tealDeep});border-radius:20px;padding:22px 24px;color:#ffffff;border:1px solid ${brand.line};">
          <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">Mahitek 3D Lab</div>
          <h1 style="margin:10px 0 6px;font-size:24px;font-weight:700;">${title}</h1>
          <p style="margin:0;color:#d0f3f2;">${subtitle}</p>
        </div>

        <div class="mail-anim" style="background:${brand.panelSoft};border-radius:20px;padding:22px;margin-top:18px;color:${brand.text};border:1px solid ${brand.line};">
          <p style="margin:0 0 12px;font-size:16px;">
            Gracias por tu registro. Aqui tienes tus codigos listos para usar:
          </p>
          ${couponBlock("Cupon de bienvenida", welcome.code, brand.teal)}
          ${campaign ? couponBlock("Cupon de campana", campaign.code, brand.red) : ""}
          ${stackNote}

          <div style="margin-top:16px;padding:14px 16px;border-radius:14px;background:${brand.panel};border:1px solid ${brand.line};">
            <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${brand.muted};margin-bottom:8px;">
              Como usar tu cupon
            </div>
            <ol style="margin:0;padding-left:18px;color:${brand.text};font-size:14px;">
              <li>Aplica el codigo al finalizar tu pedido.</li>
              <li>Si tienes dos cupones, puedes combinarlos en la misma compra.</li>
              <li>Guarda este correo para tenerlo a la mano.</li>
            </ol>
          </div>

          <div style="margin-top:18px;">
            ${button}
          </div>
        </div>

        <div style="margin-top:16px;color:${brand.muted};font-size:12px;">
          Si no solicitaste este correo, puedes ignorarlo con tranquilidad.
        </div>
      </div>
    </body>
  </html>`;
}
__name(renderCouponEmail, "renderCouponEmail");
function parseAdminTokens(env) {
  try {
    const raw = String(env.ADMIN_ROLE_TOKENS_JSON || "").trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
__name(parseAdminTokens, "parseAdminTokens");
function requireAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const token = m ? m[1].trim() : "";
  const role = String(request.headers.get("X-Admin-Role") || "general").trim().toLowerCase();
  const tokens = parseAdminTokens(env);
  const expected = String(tokens[role] || "").trim();
  if (!expected || token !== expected) {
    return { ok: false, role };
  }
  return { ok: true, role };
}
__name(requireAdmin, "requireAdmin");
async function handleSubscribe(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ ok: false, error: "invalid_json" }, { status: 400 });
  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: "invalid_email" }, { status: 400 });
  const db = await dbEnsure(env);
  const ip = getIp(request);
  const turnstile = await verifyTurnstile(env, body.turnstileToken, ip);
  if (!turnstile.ok) return json({ ok: false, error: turnstile.error }, { status: 400 });
  const { ua } = await upsertSubscriber(db, request, email, body);
  await recordEvent(db, { type: "subscribe", email, ip, payload: { ua } });
  const welcomeCampaign = await getWelcomeCampaign(db);
  if (!welcomeCampaign) return json({ ok: false, error: "missing_welcome_campaign" }, { status: 500 });
  const requestedCampaignId = getCampaignIdFromRequest(body);
  const campaign = requestedCampaignId ? await getActiveCampaign(db, requestedCampaignId) : null;
  const welcomeCoupon = await issueCoupon(db, env, { email, campaign: welcomeCampaign });
  let campaignCoupon = null;
  if (campaign && campaign.id !== BIENVENIDA_CAMPAIGN_ID) {
    campaignCoupon = await issueCoupon(db, env, { email, campaign });
  }
  await recordEvent(db, {
    type: "coupon_issued",
    email,
    campaignId: campaign ? campaign.id : BIENVENIDA_CAMPAIGN_ID,
    ip,
    payload: { welcome: Boolean(welcomeCoupon), campaign: Boolean(campaignCoupon) }
  });
  const landingUrl = String(env.PUBLIC_LANDING_URL || "").trim();
  const html = renderCouponEmail({ landingUrl, welcome: welcomeCoupon, campaign: campaignCoupon });
  const subject = campaignCoupon ? "Tus cupones de bienvenida y campana estan listos - Mahitek 3D Lab" : "Bienvenida a Mahitek 3D Lab: tu cupon esta listo";
  const emailResult = await sendEmail(env, { to: email, subject, html });
  return json({ ok: true, emailSent: emailResult.ok });
}
__name(handleSubscribe, "handleSubscribe");
async function handleAdminCampaigns(request, env) {
  const db = await dbEnsure(env);
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (request.method === "GET") {
    const res = await db.prepare(
      "SELECT id, name, prefix, discount_type AS discountType, discount_value AS discountValue, stackable, stack_group AS stackGroup, active, starts_at AS startsAt, ends_at AS endsAt, created_at AS createdAt, updated_at AS updatedAt FROM campaigns ORDER BY id ASC"
    ).all();
    return json({ ok: true, campaigns: res.results || [] });
  }
  if (request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ ok: false, error: "invalid_json" }, { status: 400 });
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    const prefix = String(body.prefix || "").trim().toUpperCase();
    const discountType = String(body.discountType || "").trim();
    const discountValue = Number(body.discountValue);
    if (!/^[A-Z0-9_-]{2,32}$/.test(id)) return json({ ok: false, error: "invalid_id" }, { status: 400 });
    if (!name || name.length > 80) return json({ ok: false, error: "invalid_name" }, { status: 400 });
    if (!/^[A-Z0-9]{2,12}$/.test(prefix)) return json({ ok: false, error: "invalid_prefix" }, { status: 400 });
    if (!["percent", "amount"].includes(discountType))
      return json({ ok: false, error: "invalid_discount_type" }, { status: 400 });
    if (!Number.isFinite(discountValue) || discountValue <= 0)
      return json({ ok: false, error: "invalid_discount_value" }, { status: 400 });
    const stackable = body.stackable ? 1 : 0;
    const stackGroup = String(body.stackGroup || "").trim() || null;
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
        ts
      ]
    );
    await recordEvent(db, {
      type: "admin_action",
      ip: getIp(request),
      payload: { action: "upsert_campaign", role: auth.role, id }
    });
    return json({ ok: true });
  }
  return json({ ok: false, error: "method" }, { status: 405 });
}
__name(handleAdminCampaigns, "handleAdminCampaigns");
async function handleAdminStats(request, env) {
  const db = await dbEnsure(env);
  const auth = requireAdmin(request, env);
  if (!auth.ok) return json({ ok: false, error: "unauthorized" }, { status: 401 });
  const subs = await dbFirst(db, "SELECT COUNT(*) AS n FROM subscribers", []);
  const coupons = await dbFirst(db, "SELECT COUNT(*) AS n FROM coupons", []);
  const campaigns = await dbFirst(db, "SELECT COUNT(*) AS n FROM campaigns WHERE active = 1", []);
  return json({
    ok: true,
    stats: {
      subscribers: subs ? subs.n : 0,
      coupons: coupons ? coupons.n : 0,
      activeCampaigns: campaigns ? campaigns.n : 0
    }
  });
}
__name(handleAdminStats, "handleAdminStats");
var src_default = {
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return corsify(request, new Response(null, { status: 204 }), env);
      }
      const url = new URL(request.url);
      const path = url.pathname;
      if (request.method === "GET" && path === "/health") {
        return corsify(request, json({ ok: true, name: "mahiteklab-api" }), env);
      }
      if (path === "/subscribe" && request.method === "POST") {
        return corsify(request, await handleSubscribe(request, env), env);
      }
      if (path === "/admin/campaigns") {
        return corsify(request, await handleAdminCampaigns(request, env), env);
      }
      if (path === "/admin/stats" && request.method === "GET") {
        return corsify(request, await handleAdminStats(request, env), env);
      }
      return corsify(request, json({ ok: false, error: "not_found" }, { status: 404 }), env);
    } catch (err) {
      return corsify(
        request,
        json({ ok: false, error: "server_error" }, { status: 500 }),
        env
      );
    }
  }
};

// C:/Users/evega/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/evega/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-A0EsGD/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/evega/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-A0EsGD/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
