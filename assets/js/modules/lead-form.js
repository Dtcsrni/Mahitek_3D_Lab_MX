/**
 * Lead form: captura de proyectos con Turnstile opcional.
 */

import CONFIG from './config.js';
import { addHealthReport } from './health-report.js';
import { loadTurnstile } from './turnstile.js';
import { validateLeadConfig } from './validation.js';

function setLeadStatus(el, msg, kind = 'info') {
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('is-ok', kind === 'ok');
  el.classList.toggle('is-error', kind === 'error');
}

function resolveLeadApiBase(attrValue, configValue) {
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

async function submitLeadViaWorker(apiBase, payload, timeoutMs) {
  const url = new URL('/leads', apiBase);
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

async function submitLeadViaForm(form, payload, timeoutMs) {
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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersTouch = window.matchMedia('(pointer: coarse)').matches;
  const connection = navigator.connection || {};
  return {
    url: trimValue(location.href, 380),
    path: trimValue(`${location.pathname}${location.search}${location.hash}`, 200),
    referrer: trimValue(document.referrer, 380),
    lang: trimValue(navigator.language || '', 40),
    languages: trimValue((navigator.languages || []).join(', '), 120),
    timezone: trimValue(Intl.DateTimeFormat().resolvedOptions().timeZone || '', 64),
    screen: trimValue(`${window.screen.width}x${window.screen.height}`, 32),
    pixelRatio: trimValue(window.devicePixelRatio, 16),
    viewport: trimValue(`${window.innerWidth}x${window.innerHeight}`, 32),
    platform: trimValue(navigator.platform || '', 80),
    userAgent: trimValue(navigator.userAgent || '', 200),
    prefersReducedMotion: trimValue(prefersReducedMotion ? 'yes' : 'no', 8),
    prefersTouch: trimValue(prefersTouch ? 'yes' : 'no', 8),
    connectionType: trimValue(connection.effectiveType || '', 32),
    connectionSaveData: trimValue(connection.saveData ? 'yes' : 'no', 8)
  };
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

    const value = trimValue(el.value, 800);
    if (!value) return;
    fields[name] = value;
  });
  return fields;
}

function setFieldInvalid(field, isInvalid) {
  if (!field) return;
  field.classList.toggle('is-invalid', isInvalid);
  field.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
}

export function initLeadForm() {
  const form = document.querySelector('.lead-form-form');
  if (!form) {
    addHealthReport('lead_form', {
      summary: { habilitado: false },
      warnings: ['lead: formulario no encontrado.'],
      errors: []
    });
    return;
  }

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const whatsappInput = form.querySelector('input[name="whatsapp"]');
  const projectSelect = form.querySelector('select[name="project_type"]');
  const messageInput = form.querySelector('textarea[name="message"]');
  const consentInput = form.querySelector('input[name="consent"]');
  const statusEl = form.querySelector('#lead-status') || form.querySelector('.lead-form-status');
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  const sourceDetailInput = form.querySelector('input[name="source_detail"]');
  const wrapperDetails = form.closest('details');

  const apiBase = resolveLeadApiBase(form.getAttribute('data-api-base'), CONFIG.LEADS_API_BASE);
  const turnstileSiteKey = String(
    form.getAttribute('data-turnstile-sitekey') || CONFIG.LEADS_TURNSTILE_SITEKEY || ''
  ).trim();
  const timeoutMs = Number(CONFIG.LEADS_TIMEOUT_MS || 10000);

  const report = validateLeadConfig({
    apiBase,
    formAction: form.action,
    turnstileSiteKey
  });
  report.summary.formulario = true;
  report.summary.camposBase = Boolean(nameInput && messageInput);
  addHealthReport('lead_form', report);

  let turnstileWidgetId = null;
  let turnstileToken = '';
  let turnstilePrimed = false;

  function ensureTurnstileContainer() {
    const existing = form.querySelector('#lead-turnstile');
    if (existing) return existing;
    const container = document.createElement('div');
    container.className = 'lead-form-turnstile';
    container.id = 'lead-turnstile';
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

  const primeTurnstile = () => {
    if (!turnstileSiteKey || turnstilePrimed) return;
    turnstilePrimed = true;
    loadTurnstile()
      .then(api => renderTurnstile(api))
      .catch(() => {});
  };

  if (turnstileSiteKey) {
    form.addEventListener('focusin', primeTurnstile, { once: true });
    form.addEventListener('pointerdown', primeTurnstile, { once: true });
    if (wrapperDetails) {
      wrapperDetails.addEventListener('toggle', () => {
        if (wrapperDetails.open) primeTurnstile();
      });
    }
  }

  form.addEventListener('input', ev => {
    if (ev.target && ev.target.classList?.contains('is-invalid')) {
      setFieldInvalid(ev.target, false);
    }
  });

  form.addEventListener('submit', async ev => {
    ev.preventDefault();

    const name = trimValue(nameInput?.value, 80);
    const email = trimValue(emailInput?.value, 120).toLowerCase();
    const whatsapp = trimValue(whatsappInput?.value, 40);
    const projectType = trimValue(projectSelect?.value, 80);
    const message = trimValue(messageInput?.value, 900);
    const hasContact = Boolean(email || whatsapp);

    setFieldInvalid(nameInput, !name);
    setFieldInvalid(messageInput, !message);
    setFieldInvalid(projectSelect, !projectType);
    setFieldInvalid(emailInput, email ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : false);
    setFieldInvalid(whatsappInput, false);

    if (!name) {
      setLeadStatus(statusEl, 'Comparte tu nombre para iniciar el brief.', 'error');
      nameInput?.focus();
      return;
    }
    if (!hasContact) {
      setLeadStatus(statusEl, 'Indica correo o WhatsApp para responderte.', 'error');
      emailInput?.focus();
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLeadStatus(statusEl, 'El correo no parece válido.', 'error');
      emailInput?.focus();
      return;
    }
    if (!projectType) {
      setLeadStatus(statusEl, 'Selecciona el tipo de proyecto.', 'error');
      projectSelect?.focus();
      return;
    }
    if (!message) {
      setLeadStatus(statusEl, 'Cuéntanos un poco más sobre tu idea.', 'error');
      messageInput?.focus();
      return;
    }
    if (consentInput && !consentInput.checked) {
      setLeadStatus(statusEl, 'Necesitamos tu consentimiento para contactar.', 'error');
      consentInput?.focus();
      return;
    }

    setLeadStatus(statusEl, 'Enviando brief...', 'info');
    if (submitBtn) submitBtn.disabled = true;

    const ignoreKeys = new Set([
      'name',
      'email',
      'whatsapp',
      'project_type',
      'message',
      'source_detail',
      'consent',
      'cf-turnstile-response'
    ]);
    const details = collectExtraFields(form, ignoreKeys);
    const utm = getUtmParams();
    const meta = getClientMeta();
    const sourceDetail = trimValue(sourceDetailInput?.value || '', 64);

    const payload = {
      name,
      email: email || undefined,
      whatsapp: whatsapp || undefined,
      projectType: projectType || undefined,
      message,
      source: 'lead_form',
      sourceDetail: sourceDetail || undefined,
      details: Object.keys(details).length ? details : undefined,
      utm: Object.keys(utm).length ? utm : undefined,
      meta: Object.keys(meta).length ? meta : undefined,
      consent: consentInput?.checked ? 'yes' : undefined
    };

    let turnstileApi = null;
    if (turnstileSiteKey) {
      try {
        primeTurnstile();
        turnstileApi = await loadTurnstile();
      } catch (_) {
        setLeadStatus(statusEl, 'No pudimos verificar el formulario. Intenta de nuevo.', 'error');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      renderTurnstile(turnstileApi);
      const token = getTurnstileToken(turnstileApi);
      if (!token) {
        setLeadStatus(statusEl, 'Completa la verificación antes de enviar.', 'error');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
      payload.turnstileToken = token;
    }

    try {
      if (!apiBase) throw new Error('missing_api_base');
      await submitLeadViaWorker(apiBase, payload, timeoutMs);
      setLeadStatus(
        statusEl,
        'Brief recibido. Te contactamos con ruta y estimación inicial.',
        'ok'
      );
      form.reset();
      if (turnstileApi) resetTurnstile(turnstileApi);
      if (wrapperDetails) wrapperDetails.open = true;
    } catch (err) {
      const canFallback = typeof form.action === 'string' && form.action.includes('formspree.io');
      if (canFallback) {
        try {
          await submitLeadViaForm(form, payload, timeoutMs);
          setLeadStatus(
            statusEl,
            'Brief recibido. Te contactamos con ruta y estimación inicial.',
            'ok'
          );
          form.reset();
          if (turnstileApi) resetTurnstile(turnstileApi);
          if (wrapperDetails) wrapperDetails.open = true;
        } catch (_) {
          setLeadStatus(statusEl, 'No pudimos enviar el brief. Intenta de nuevo.', 'error');
        }
      } else {
        setLeadStatus(statusEl, 'No pudimos enviar el brief. Intenta de nuevo.', 'error');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
