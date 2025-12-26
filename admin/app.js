const DEFAULT_API_BASE = 'https://mahiteklab-api.mahiteklab.workers.dev';
const CAMPAIGN_STATUS_LABELS = {
  live: 'Activa',
  scheduled: 'Programada',
  expired: 'Vencida',
  paused: 'Pausada'
};
const CAMPAIGN_STATUS_SORT = {
  live: 0,
  scheduled: 1,
  expired: 2,
  paused: 3
};

let campaignCache = [];

function $(id) {
  return document.getElementById(id);
}

function getState() {
  const saved = JSON.parse(sessionStorage.getItem('mahitek_admin') || 'null');
  return saved && typeof saved === 'object' ? saved : null;
}

function setState(next) {
  sessionStorage.setItem('mahitek_admin', JSON.stringify(next));
}

function clearState() {
  sessionStorage.removeItem('mahitek_admin');
}

function setStatus(el, msg, kind = 'info') {
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = kind === 'error' ? '#fda4af' : kind === 'ok' ? '#86efac' : '#a7b0bf';
}

function authHeaders(state) {
  return {
    authorization: `Bearer ${state.token}`,
    'x-admin-role': state.role
  };
}

async function apiFetch(path, state, { method = 'GET', body = null } = {}) {
  const url = new URL(path, state.apiBase);
  const headers = { ...authHeaders(state) };
  if (body) headers['content-type'] = 'application/json';

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data && data.error ? data.error : `http_${res.status}`;
    throw new Error(err);
  }
  return data;
}

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseDateValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = parseDateValue(value);
  if (!d) return '—';
  return d.toISOString().slice(0, 10);
}

function formatTimeLabel(date = new Date()) {
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function getCampaignState(c) {
  if (!c || !c.active) return 'paused';
  const now = new Date();
  const start = parseDateValue(c.startsAt);
  const end = parseDateValue(c.endsAt);
  if (start && now < start) return 'scheduled';
  if (end && now > end) return 'expired';
  return 'live';
}

async function copyToClipboard(value) {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    await navigator.clipboard.writeText(raw);
    return true;
  } catch (_) {
    window.prompt('Copia el valor:', raw);
    return false;
  }
}

function renderCampaignCard(c) {
  const active = Boolean(c.active);
  const status = getCampaignState(c);
  const badge = `<span class="badge badge--${status}">${CAMPAIGN_STATUS_LABELS[status]}</span>`;
  const stackable = c.stackable ? 'Si' : 'No';
  const discount = c.discountType === 'amount' ? `$${c.discountValue}` : `${c.discountValue}%`;
  const discountTypeLabel = c.discountType === 'amount' ? 'Monto' : 'Porcentaje';
  const range = `${formatDate(c.startsAt)} → ${formatDate(c.endsAt)}`;
  const updated = formatDate(c.updatedAt || c.createdAt);
  const isWelcome = String(c.id || '').toUpperCase() === 'BIENVENIDA';

  return `
    <article class="campaign${isWelcome ? ' campaign--welcome' : ''}" data-cid="${c.id}" data-status="${status}">
      <div class="campaign__head">
        <div>
          <strong>${escapeHTML(c.name)}</strong>
          <div class="muted">${escapeHTML(c.id)} · <span class="muted">Prefijo:</span> ${escapeHTML(c.prefix)}</div>
        </div>
        ${badge}
      </div>
      <div class="campaign__chips">
        <span class="chip chip--accent">${escapeHTML(discountTypeLabel)}</span>
        <span class="chip">${escapeHTML(discount)}</span>
        <span class="chip chip--muted">Stack: ${escapeHTML(stackable)}</span>
      </div>
      <div class="campaign__meta">
        <div><span class="muted">Rango:</span> ${escapeHTML(range)}</div>
        <div><span class="muted">Stack group:</span> ${escapeHTML(c.stackGroup || '—')}</div>
        <div><span class="muted">Actualizado:</span> ${escapeHTML(updated)}</div>
      </div>
      <div class="campaign__actions">
        <button class="btn btn-ghost" type="button" data-action="edit">Editar</button>
        <button class="btn btn-ghost" type="button" data-action="duplicate">Duplicar</button>
        <button class="btn btn-ghost" type="button" data-action="copy">Copiar ID</button>
        <button class="btn btn-ghost" type="button" data-action="toggle" ${
          isWelcome ? 'disabled' : ''
        }>${active ? 'Pausar' : 'Activar'}</button>
      </div>
    </article>
  `;
}

function loadFormFromCampaign(c) {
  $('c-id').value = c ? c.id : '';
  $('c-name').value = c ? c.name : '';
  $('c-prefix').value = c ? c.prefix : '';
  $('c-type').value = c ? c.discountType : 'percent';
  $('c-value').value = c ? String(c.discountValue) : '10';
  $('c-active').value = c ? (c.active ? 'true' : 'false') : 'true';
  $('c-stackable').value = c ? (c.stackable ? 'true' : 'false') : 'true';
  $('c-start').value = c && c.startsAt ? formatDate(c.startsAt) : '';
  $('c-end').value = c && c.endsAt ? formatDate(c.endsAt) : '';
  $('c-stack-group').value = c ? c.stackGroup || '' : 'bienvenida_plus_campaign';
}

function getCampaignFromForm() {
  return {
    id: String($('c-id').value || '')
      .trim()
      .toUpperCase(),
    name: String($('c-name').value || '').trim(),
    prefix: String($('c-prefix').value || '')
      .trim()
      .toUpperCase(),
    discountType: $('c-type').value,
    discountValue: Number($('c-value').value),
    active: $('c-active').value === 'true',
    stackable: $('c-stackable').value === 'true',
    stackGroup: String($('c-stack-group').value || '').trim() || 'bienvenida_plus_campaign',
    startsAt: $('c-start').value || null,
    endsAt: $('c-end').value || null
  };
}

function validateCampaign(campaign) {
  if (!/^[A-Z0-9_-]{2,32}$/.test(campaign.id)) {
    return 'ID invalido (usa A-Z, 0-9, _ o -).';
  }
  if (!campaign.name) return 'Falta nombre.';
  if (!/^[A-Z0-9]{2,12}$/.test(campaign.prefix)) {
    return 'Prefijo invalido (2-12 caracteres A-Z/0-9).';
  }
  if (!['percent', 'amount'].includes(campaign.discountType)) {
    return 'Tipo de descuento invalido.';
  }
  if (!Number.isFinite(campaign.discountValue) || campaign.discountValue <= 0) {
    return 'Valor de descuento invalido.';
  }
  if (campaign.startsAt && campaign.endsAt) {
    const start = parseDateValue(campaign.startsAt);
    const end = parseDateValue(campaign.endsAt);
    if (start && end && end < start) return 'La fecha fin debe ser posterior a inicio.';
  }
  return '';
}

function getCampaignFilters() {
  return {
    search: String($('campaign-search')?.value || '')
      .trim()
      .toLowerCase(),
    status: $('campaign-status')?.value || 'all',
    sort: $('campaign-sort')?.value || 'recent'
  };
}

function filterCampaigns(list, filters) {
  return list.filter(c => {
    const status = getCampaignState(c);
    if (filters.status !== 'all' && status !== filters.status) return false;
    if (!filters.search) return true;
    const haystack = `${c.name || ''} ${c.id || ''} ${c.prefix || ''}`.toLowerCase();
    return haystack.includes(filters.search);
  });
}

function sortCampaigns(list, sortKey) {
  const sorted = [...list];
  if (sortKey === 'name') {
    sorted.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    return sorted;
  }
  if (sortKey === 'discount') {
    sorted.sort((a, b) => Number(b.discountValue || 0) - Number(a.discountValue || 0));
    return sorted;
  }
  if (sortKey === 'status') {
    sorted.sort(
      (a, b) =>
        CAMPAIGN_STATUS_SORT[getCampaignState(a)] - CAMPAIGN_STATUS_SORT[getCampaignState(b)]
    );
    return sorted;
  }
  sorted.sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || 0).getTime() -
      new Date(a.updatedAt || a.createdAt || 0).getTime()
  );
  return sorted;
}

function renderCampaignList() {
  const list = $('campaign-list');
  const filters = getCampaignFilters();
  const filtered = sortCampaigns(filterCampaigns(campaignCache, filters), filters.sort);

  list.innerHTML =
    filtered.map(renderCampaignCard).join('') ||
    '<div class="empty-state">Sin campanas que coincidan con el filtro.</div>';

  list.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', ev => {
      const card = ev.currentTarget.closest('.campaign');
      const id = card?.dataset?.cid;
      const c = campaignCache.find(x => x.id === id);
      openModal(c);
    });
  });

  list.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
    btn.addEventListener('click', ev => {
      const card = ev.currentTarget.closest('.campaign');
      const id = card?.dataset?.cid;
      const c = campaignCache.find(x => x.id === id);
      if (!c) return;
      const copy = {
        ...c,
        id: `${c.id}_COPY`,
        name: `${c.name} (copia)`,
        active: false
      };
      openModal(copy);
    });
  });

  list.querySelectorAll('[data-action="copy"]').forEach(btn => {
    btn.addEventListener('click', ev => {
      const card = ev.currentTarget.closest('.campaign');
      const id = card?.dataset?.cid;
      if (!id) return;
      copyToClipboard(id);
    });
  });

  list.querySelectorAll('[data-action="toggle"]').forEach(btn => {
    btn.addEventListener('click', async ev => {
      const card = ev.currentTarget.closest('.campaign');
      const id = card?.dataset?.cid;
      const c = campaignCache.find(x => x.id === id);
      if (!c) return;
      const next = { ...c, active: !c.active };
      try {
        await saveCampaignData(next, true);
        await refreshCampaigns();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  });
}

function updateCampaignSummary() {
  const total = campaignCache.length;
  const active = campaignCache.filter(c => getCampaignState(c) === 'live').length;
  const inactive = campaignCache.filter(c => getCampaignState(c) === 'paused').length;
  $('campaign-total').textContent = total;
  $('campaign-active').textContent = active;
  $('campaign-inactive').textContent = inactive;
  $('campaign-sync').textContent = formatTimeLabel();
}

async function refreshCampaigns() {
  const state = getState();
  if (!state) return;

  const list = $('campaign-list');
  list.innerHTML = '<div class="muted">Cargando campanas...</div>';

  const data = await apiFetch('/admin/campaigns', state);
  campaignCache = data.campaigns || [];
  updateCampaignSummary();
  renderCampaignList();
}

async function refreshStats() {
  const state = getState();
  if (!state) return;
  const data = await apiFetch('/admin/stats', state);
  $('stat-subs').textContent = data.stats?.subscribers ?? '-';
  $('stat-coupons').textContent = data.stats?.coupons ?? '-';
  $('stat-campaigns').textContent = data.stats?.activeCampaigns ?? '-';
}

function openModal(campaign) {
  $('modal-title').textContent = campaign ? `Editar: ${campaign.id}` : 'Nueva campana';
  loadFormFromCampaign(campaign);
  setStatus($('modal-status'), '');
  $('campaign-modal').showModal();
}

async function saveCampaignData(campaign, silent = false) {
  const state = getState();
  if (!state) return;

  if (!silent) setStatus($('modal-status'), 'Guardando...');
  const error = validateCampaign(campaign);
  if (error) {
    if (!silent) setStatus($('modal-status'), error, 'error');
    throw new Error(error);
  }

  await apiFetch('/admin/campaigns', state, { method: 'POST', body: campaign });
  if (!silent) setStatus($('modal-status'), 'Guardado OK', 'ok');
  return true;
}

async function saveCampaign() {
  const campaign = getCampaignFromForm();
  await saveCampaignData(campaign);
  await refreshCampaigns();
  setTimeout(() => $('campaign-modal').close(), 350);
}

function hydrateUiFromState(state) {
  $('role').value = state.role || 'general';
  $('token').value = state.token || '';
  $('apiBase').value = state.apiBase || DEFAULT_API_BASE;
  $('env-pill').textContent = `API: ${state.apiBase || DEFAULT_API_BASE}`;
}

async function tryConnect() {
  const role = $('role').value;
  const token = $('token').value.trim();
  const apiBase = ($('apiBase').value || DEFAULT_API_BASE).trim().replace(/\/+$/, '');
  if (!token) {
    setStatus($('auth-status'), 'Falta token.', 'error');
    return;
  }

  setStatus($('auth-status'), 'Conectando...');
  const state = { role, token, apiBase };
  setState(state);
  hydrateUiFromState(state);

  try {
    await refreshCampaigns();
    await refreshStats();
    setStatus($('auth-status'), 'Conectado OK', 'ok');
  } catch (err) {
    clearState();
    setStatus($('auth-status'), `Error: ${err.message}`, 'error');
  }
}

function main() {
  const state = getState();
  if (state) {
    hydrateUiFromState(state);
    refreshCampaigns().catch(() => {});
    refreshStats().catch(() => {});
    setStatus($('auth-status'), 'Sesion recuperada.', 'ok');
  } else {
    $('apiBase').value = DEFAULT_API_BASE;
  }

  $('btn-login').addEventListener('click', tryConnect);
  $('btn-logout').addEventListener('click', () => {
    clearState();
    location.reload();
  });
  $('btn-refresh').addEventListener('click', () => refreshCampaigns().catch(() => {}));
  $('btn-stats').addEventListener('click', () => refreshStats().catch(() => {}));
  $('btn-new').addEventListener('click', () => openModal(null));
  $('btn-save').addEventListener('click', () =>
    saveCampaign().catch(e => setStatus($('modal-status'), e.message, 'error'))
  );

  const search = $('campaign-search');
  const status = $('campaign-status');
  const sort = $('campaign-sort');
  [search, status, sort].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => renderCampaignList());
    el.addEventListener('change', () => renderCampaignList());
  });
}

main();
