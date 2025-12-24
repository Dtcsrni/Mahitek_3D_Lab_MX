const DEFAULT_API_BASE = 'https://mahiteklab-api.mahiteklab.workers.dev';

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

function renderCampaignCard(c) {
  const active = Boolean(c.active);
  const badge = active ? '<span class="badge badge--on">Activa</span>' : '<span class="badge">Inactiva</span>';
  const stackable = c.stackable ? 'Sí' : 'No';
  const discount = c.discountType === 'amount' ? `$${c.discountValue}` : `${c.discountValue}%`;

  return `
    <article class="campaign" data-cid="${c.id}">
      <div class="campaign__head">
        <div>
          <strong>${escapeHTML(c.name)}</strong>
          <div class="muted">${escapeHTML(c.id)} · <span class="muted">Prefijo:</span> ${escapeHTML(c.prefix)}</div>
        </div>
        ${badge}
      </div>
      <div class="campaign__meta">
        <div><span class="muted">Descuento:</span> <strong>${escapeHTML(discount)}</strong></div>
        <div><span class="muted">Acumulable:</span> ${escapeHTML(stackable)} (solo con BIENVENIDA)</div>
      </div>
      <div class="campaign__actions">
        <button class="btn btn-ghost" type="button" data-action="edit">Editar</button>
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
}

function getCampaignFromForm() {
  return {
    id: String($('c-id').value || '').trim().toUpperCase(),
    name: String($('c-name').value || '').trim(),
    prefix: String($('c-prefix').value || '').trim().toUpperCase(),
    discountType: $('c-type').value,
    discountValue: Number($('c-value').value),
    active: $('c-active').value === 'true',
    stackable: $('c-stackable').value === 'true',
    stackGroup: 'bienvenida_plus_campaign'
  };
}

async function refreshCampaigns() {
  const state = getState();
  if (!state) return;

  const list = $('campaign-list');
  list.innerHTML = '<div class="muted">Cargando campañas...</div>';

  const data = await apiFetch('/admin/campaigns', state);
  const campaigns = data.campaigns || [];
  list.innerHTML = campaigns.map(renderCampaignCard).join('') || '<div class="muted">Sin campañas.</div>';

  list.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', ev => {
      const card = ev.currentTarget.closest('.campaign');
      const id = card?.dataset?.cid;
      const c = campaigns.find(x => x.id === id);
      openModal(c);
    });
  });
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
  $('modal-title').textContent = campaign ? `Editar: ${campaign.id}` : 'Nueva campaña';
  loadFormFromCampaign(campaign);
  setStatus($('modal-status'), '');
  $('campaign-modal').showModal();
}

async function saveCampaign() {
  const state = getState();
  if (!state) return;

  setStatus($('modal-status'), 'Guardando...');
  const campaign = getCampaignFromForm();
  await apiFetch('/admin/campaigns', state, { method: 'POST', body: campaign });
  setStatus($('modal-status'), 'Guardado ✓', 'ok');
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
    setStatus($('auth-status'), 'Conectado ✓', 'ok');
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
    setStatus($('auth-status'), 'Sesión recuperada.', 'ok');
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
}

main();
