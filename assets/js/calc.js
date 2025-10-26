import { PACKS, selectBestPack, suggestToReachMin } from './promos.js';
import { METHODS } from './pagos.js';

const UNIT_PRICE = 3; // público
const INTERNAL_COST = 0.57; // admin oculto

function currency(n) {
  return `$${n.toFixed(2)} MXN`;
}

function buildSummary({ qty, pack, method, subtotal }) {
  return [
    'Pedido Mahitek 3D Lab:',
    `- Stickers 50×50: ${qty} uds`,
    `- Pack sugerido: ${pack ? `${pack.units} uds por $${pack.price}` : 'N/A'}`,
    `Subtotal: $${subtotal} MXN`,
    `Método de pago: ${method}`,
    '¿Pickup local o envío?'
  ].join('\n');
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(ta);
}

export function initCalc() {
  const root = document.getElementById('calc');
  if (!root) return;

  const container = document.createElement('div');
  container.className = 'container calc-grid';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.id = 'calc-title';
  title.textContent = 'Calculadora de pedido';
  container.appendChild(title);

  const panel = document.createElement('div');
  panel.className = 'card calc-card';

  panel.innerHTML = `
    <div class="card-body">
      <label class="calc-label" for="calc-qty">Cantidad de stickers 50×50</label>
      <input id="calc-qty" class="calc-input" type="number" min="1" step="1" value="10" />

      <div class="calc-row" id="calc-suggestion"></div>
      <div class="calc-row" id="calc-missing"></div>

      <label class="calc-label" for="calc-method">Método de pago</label>
      <select id="calc-method" class="calc-select"></select>

      <div class="calc-actions">
        <button id="btn-copy" class="btn btn-primary">Copiar pedido</button>
        <button id="btn-email" class="btn btn-ghost">Enviar por correo</button>
        <button id="btn-download" class="btn">Descargar .txt</button>
      </div>

      <p class="calc-help">Copia en 1 clic, abre tu correo con el pedido listo o descarga un .txt ligero.</p>

      <div id="calc-admin" class="calc-admin" hidden></div>
    </div>
  `;

  container.appendChild(panel);
  root.appendChild(container);

  // Poblar métodos
  const methodSelect = panel.querySelector('#calc-method');
  METHODS.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.label;
    opt.textContent = `${m.label}`;
    methodSelect.appendChild(opt);
  });

  const qtyInput = panel.querySelector('#calc-qty');
  const suggestionEl = panel.querySelector('#calc-suggestion');
  const missingEl = panel.querySelector('#calc-missing');
  suggestionEl.setAttribute('role', 'status');
  suggestionEl.setAttribute('aria-live', 'polite');
  missingEl.setAttribute('role', 'status');
  missingEl.setAttribute('aria-live', 'polite');
  const adminEl = panel.querySelector('#calc-admin');

  function recalc() {
    const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
    const soloPrice = qty * UNIT_PRICE;
    const packOpt = selectBestPack(qty);
    const packPrice = packOpt ? packOpt.price : Infinity;

    let usePack = packPrice < soloPrice;
    const chosenSubtotal = usePack ? packPrice : soloPrice;

    const save = Math.max(0, soloPrice - packPrice);
    let breakdownHTML = '';
    if (usePack && packOpt && Array.isArray(packOpt.breakdown)) {
      const showBreak =
        packOpt.breakdown.length > 1 || (packOpt.breakdown[0] && packOpt.breakdown[0].count > 1);
      if (showBreak) {
        const items = packOpt.breakdown
          .map(
            b => `
            <li>${b.count}× (${b.units} uds · $${b.price})</li>
          `
          )
          .join('');
        breakdownHTML = `
          <details class="calc-breakdown">
            <summary>Ver desglose de packs</summary>
            <ul>${items}</ul>
          </details>
        `;
      }
    }

    suggestionEl.innerHTML = usePack
      ? `<div class="calc-suggest"><strong>Pack sugerido:</strong> ${packOpt.units} uds por ${currency(
          packOpt.price
        )} <span class="badge">$${(packOpt.price / packOpt.units).toFixed(2)}/ud</span> ${
          save > 0 ? `<span class=\"badge badge-save\">Ahorra ${currency(save)}</span>` : ''
        } <span class="hint">(suelto: ${currency(soloPrice)})</span>${breakdownHTML}</div>`
      : `<div class="calc-suggest"><strong>Compra suelta:</strong> ${qty} uds por ${currency(
          soloPrice
        )} <span class="badge">$${UNIT_PRICE.toFixed(2)}/ud</span></div>`;

    const missing = suggestToReachMin(chosenSubtotal);
    missingEl.innerHTML =
      missing > 0
        ? `<div class="calc-missing">Faltan <strong>${currency(missing)}</strong> para llegar al mínimo de ${currency(
            40
          )}</div>`
        : `<div class="calc-missing ok">✅ Alcanzas el mínimo de ${currency(40)}</div>`;

    // Admin panel
    const isAdmin = /[?&]admin=1\b/.test(window.location.search);
    if (isAdmin) {
      const margin = (chosenSubtotal - qty * INTERNAL_COST) / chosenSubtotal;
      const ok = margin >= 0.66;
      adminEl.hidden = false;
      adminEl.innerHTML = `
        <div class="admin-line">Costo interno estimado: ${currency(qty * INTERNAL_COST)}</div>
        <div class="admin-line">Margen estimado: <strong>${(margin * 100).toFixed(1)}%</strong> ${
          ok ? '✅' : '⚠️'
        }</div>
        ${ok ? '' : '<div class="admin-warn">Margen bajo el objetivo del 66%.</div>'}
      `;
    } else {
      adminEl.hidden = true;
      adminEl.innerHTML = '';
    }

    return {
      qty,
      pack: usePack ? packOpt : null,
      subtotal: Math.round(chosenSubtotal * 100) / 100
    };
  }

  function buildActions(model) {
    const { email, emailSubject } = window.MAHITEK_CONTACT || {};
    const method = methodSelect.value || 'No especificado';
    const summary = buildSummary({ ...model, method, subtotal: model.subtotal });

    // Copy
    panel.querySelector('#btn-copy').onclick = async () => {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(summary);
        else fallbackCopy(summary);
        panel.querySelector('#btn-copy').textContent = '¡Copiado!';
        setTimeout(() => (panel.querySelector('#btn-copy').textContent = 'Copiar pedido'), 1500);
      } catch (e) {
        fallbackCopy(summary);
      }
    };

    // Email
    panel.querySelector('#btn-email').onclick = () => {
      const to = email || 'mahitek3dlabmx@gmail.com';
      const subject = emailSubject || 'Pedido Mahitek 3D Lab';
      const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      window.location.href = href;
    };

    // Download
    panel.querySelector('#btn-download').onclick = () => {
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pedido_mahitek.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }

  let model = recalc();
  buildActions(model);

  qtyInput.addEventListener('input', () => {
    model = recalc();
    buildActions(model);
  });
  methodSelect.addEventListener('change', () => buildActions(model));
}
