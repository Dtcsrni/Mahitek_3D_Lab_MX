/**
 * Newsletter: suscripción con Worker y Turnstile (opcional).
 */

import CONFIG from './config.js';
import { addHealthReport } from './health-report.js';
import { validateNewsletterConfig } from './validation.js';

function setNewsletterStatus(el, msg, kind = 'info') {
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('is-ok', kind === 'ok');
  el.classList.toggle('is-error', kind === 'error');
}

function resolveNewsletterApiBase(attrValue, configValue) {
  const fromAttr = String(attrValue || '').trim();
  if (fromAttr) return fromAttr;

  const fromConfig = String(configValue || '').trim();
  if (fromConfig) return fromConfig;

  const host = String(window.location.hostname || '').toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8787';
  }
  return '';
}

async function subscribeViaWorker(apiBase, payload, timeoutMs) {
  const url = new URL('/subscribe', apiBase);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = data && data.error ? data.error : `http_${res.status}`;
      throw new Error(err);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function subscribeViaForm(form, payload, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = data && data.error ? data.error : `http_${res.status}`;
      throw new Error(err);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function getCampaignIdFromURL() {
  const sp = new URLSearchParams(location.search);
  const raw = sp.get('campaign') || sp.get('utm_campaign') || sp.get('camp') || sp.get('c');
  if (!raw) return '';
  return String(raw).trim().slice(0, 64);
}

function trimValue(value, max = 180) {
  const s = String(value || '').trim();
  if (!s) return '';
  return s.length > max ? s.slice(0, max) : s;
}

function getUtmParams() {
  const sp = new URLSearchParams(location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const out = {};
  keys.forEach(key => {
    const value = trimValue(sp.get(key));
    if (value) out[key] = value;
  });
  return out;
}

function getClientMeta() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
  const prefersTouch = window.matchMedia('(pointer: coarse)').matches;
  const connection = navigator.connection || {};
  const meta = {
    url: trimValue(location.href, 380),
    path: trimValue(`${location.pathname}${location.search}${location.hash}`, 200),
    referrer: trimValue(document.referrer, 380),
    lang: trimValue(navigator.language || '', 40),
    languages: trimValue((navigator.languages || []).join(', '), 120),
    timezone: trimValue(Intl.DateTimeFormat().resolvedOptions().timeZone || '', 64),
    screen: trimValue(`${window.screen.width}x${window.screen.height}`, 32),
    screenColorDepth: trimValue(window.screen.colorDepth, 16),
    pixelRatio: trimValue(window.devicePixelRatio, 16),
    viewport: trimValue(`${window.innerWidth}x${window.innerHeight}`, 32),
    platform: trimValue(navigator.platform || '', 80),
    userAgent: trimValue(navigator.userAgent || '', 200),
    vendor: trimValue(navigator.vendor || '', 80),
    deviceMemory: trimValue(navigator.deviceMemory || '', 16),
    hardwareConcurrency: trimValue(navigator.hardwareConcurrency || '', 16),
    maxTouchPoints: trimValue(navigator.maxTouchPoints || '', 8),
    cookieEnabled: trimValue(navigator.cookieEnabled ? 'yes' : 'no', 8),
    doNotTrack: trimValue(navigator.doNotTrack || '', 8),
    online: trimValue(navigator.onLine ? 'yes' : 'no', 8),
    prefersDark: trimValue(prefersDark ? 'yes' : 'no', 8),
    prefersLight: trimValue(prefersLight ? 'yes' : 'no', 8),
    prefersReducedMotion: trimValue(prefersReducedMotion ? 'yes' : 'no', 8),
    prefersContrast: trimValue(prefersContrast ? 'yes' : 'no', 8),
    prefersTouch: trimValue(prefersTouch ? 'yes' : 'no', 8),
    connectionType: trimValue(connection.effectiveType || '', 32),
    connectionDownlink: trimValue(connection.downlink || '', 16),
    connectionRtt: trimValue(connection.rtt || '', 16),
    connectionSaveData: trimValue(connection.saveData ? 'yes' : 'no', 8)
  };
  return meta;
}

function collectExtraFields(form, ignoreKeys) {
  const fields = {};
  const elements = form.querySelectorAll('input, select, textarea');
  elements.forEach(el => {
    const name = String(el.name || '').trim();
    if (!name || ignoreKeys.has(name)) return;

    if (el.type === 'checkbox') {
      if (!el.checked) return;
      fields[name] = trimValue(el.value || true);
      return;
    }
    if (el.type === 'radio') {
      if (!el.checked) return;
      fields[name] = trimValue(el.value);
      return;
    }

    const value = trimValue(el.value);
    if (!value) return;
    fields[name] = value;
  });
  return fields;
}

export function initNewsletter() {
  const form = document.querySelector('form.newsletter');
  if (!form) {
    addHealthReport('newsletter', {
      summary: { habilitado: false },
      warnings: ['newsletter: formulario no encontrado.'],
      errors: []
    });
    return;
  }

  const emailInput =
    form.querySelector('input[type="email"][name="email"]') ||
    form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"], input[type="submit"]');
  const statusEl =
    form.querySelector('#newsletter-status') || form.querySelector('.newsletter-status');
  const sourceDetailInput = form.querySelector('input[name="source_detail"]');
  const apiBase = resolveNewsletterApiBase(
    form.getAttribute('data-api-base'),
    CONFIG.NEWSLETTER_API_BASE
  );
  const turnstileSiteKey = String(
    form.getAttribute('data-turnstile-sitekey') || CONFIG.NEWSLETTER_TURNSTILE_SITEKEY || ''
  ).trim();
  const timeoutMs = Number(CONFIG.NEWSLETTER_TIMEOUT_MS || 8000);

  const report = validateNewsletterConfig({
    apiBase,
    formAction: form.action,
    turnstileSiteKey
  });
  report.summary.formulario = true;
  report.summary.emailInput = Boolean(emailInput);
  report.summary.status = Boolean(statusEl);

  if (!emailInput) {
    report.warnings.push('newsletter: input de email no encontrado.');
    addHealthReport('newsletter', report);
    return;
  }

  addHealthReport('newsletter', report);

  let turnstilePromise = null;
  let turnstileWidgetId = null;
  let turnstileToken = '';

  function loadTurnstile() {
    if (turnstilePromise) return turnstilePromise;
    turnstilePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error('turnstile_load_failed'));
      document.head.appendChild(script);
    });
    return turnstilePromise;
  }

  function ensureTurnstileContainer() {
    const existing = form.querySelector('#newsletter-turnstile');
    if (existing) return existing;
    const container = document.createElement('div');
    container.className = 'newsletter-turnstile';
    container.id = 'newsletter-turnstile';
    form.insertBefore(container, statusEl || null);
    return container;
  }

  function renderTurnstile(api) {
    if (!api || !turnstileSiteKey || turnstileWidgetId !== null) return;
    const container = ensureTurnstileContainer();
    turnstileWidgetId = api.render(container, {
      sitekey: turnstileSiteKey,
      callback: token => {
        turnstileToken = token || '';
      },
      'expired-callback': () => {
        turnstileToken = '';
      },
      'error-callback': () => {
        turnstileToken = '';
      }
    });
  }

  function getTurnstileToken(api) {
    if (!api || turnstileWidgetId === null) return turnstileToken;
    return turnstileToken;
  }

  function resetTurnstile(api) {
    if (!api || turnstileWidgetId === null) return;
    api.reset(turnstileWidgetId);
    turnstileToken = '';
  }

  if (turnstileSiteKey) {
    loadTurnstile()
      .then(api => renderTurnstile(api))
      .catch(() => {});
  }

  const floatingCta = document.querySelector('.floating-coupon');
  if (floatingCta && sourceDetailInput) {
    floatingCta.addEventListener('click', () => {
      sourceDetailInput.value = 'floating_coupon';
    });
  }

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const email = String(emailInput.value || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus(statusEl, 'Escribe un correo válido.', 'error');
      emailInput.focus();
      return;
    }

    setNewsletterStatus(statusEl, 'Enviando...', 'info');
    if (button) button.disabled = true;

    const ignoreKeys = new Set(['email', 'source_detail', 'cf-turnstile-response']);
    const details = collectExtraFields(form, ignoreKeys);
    const utm = getUtmParams();
    const meta = getClientMeta();
    const sourceDetail = trimValue(sourceDetailInput?.value || '', 64);

    const payload = {
      email,
      campaign: getCampaignIdFromURL() || undefined,
      source: 'newsletter_form',
      sourceDetail: sourceDetail || undefined,
      referrer: meta.referrer || undefined,
      landingPath: meta.path || undefined,
      details: Object.keys(details).length ? details : undefined,
      utm: Object.keys(utm).length ? utm : undefined,
      meta: Object.keys(meta).length ? meta : undefined
    };

    let turnstileApi = null;
    if (turnstileSiteKey) {
      try {
        turnstileApi = await loadTurnstile();
      } catch (_) {
        setNewsletterStatus(
          statusEl,
          'No pudimos verificar el formulario. Intenta de nuevo.',
          'error'
        );
        if (button) button.disabled = false;
        return;
      }

      renderTurnstile(turnstileApi);
      const token = getTurnstileToken(turnstileApi);
      if (!token) {
        setNewsletterStatus(statusEl, 'Completa la verificación antes de enviar.', 'error');
        if (button) button.disabled = false;
        return;
      }
      payload.turnstileToken = token;
    }

    try {
      if (!apiBase) throw new Error('missing_api_base');
      const data = await subscribeViaWorker(apiBase, payload, timeoutMs);
      const msg = data.emailSent
        ? '¡Gracias por registrarte! Tu cupón ya va en camino a tu correo.'
        : '¡Gracias! Guardamos tu registro y reservamos tu cupón. El correo puede tardar unos minutos.';
      setNewsletterStatus(statusEl, msg, 'ok');
      form.reset();
      if (turnstileApi) resetTurnstile(turnstileApi);
    } catch (err) {
      const canFallback = typeof form.action === 'string' && form.action.includes('formspree.io');
      if (canFallback) {
        try {
          await subscribeViaForm(form, payload, timeoutMs);
          setNewsletterStatus(
            statusEl,
            '¡Gracias! Te registramos en la lista. Tu cupón puede tardar unos minutos en llegar.',
            'ok'
          );
          form.reset();
          if (turnstileApi) resetTurnstile(turnstileApi);
        } catch (_) {
          setNewsletterStatus(
            statusEl,
            'No se pudo enviar el registro. Intenta más tarde.',
            'error'
          );
        }
      } else {
        setNewsletterStatus(statusEl, 'No se pudo enviar el registro. Intenta más tarde.', 'error');
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
}
