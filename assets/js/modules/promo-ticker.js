/**
 * Banda superior de promociones en header.
 */

import CONFIG from './config.js';
import { loadJSON } from './data-loader.js';
import { escapeHTML } from './security.js';

let tickerLoaded = false;

function getActivePromos(promos) {
  if (!Array.isArray(promos)) return [];
  const now = new Date();

  return promos.filter(promo => {
    if (promo?.estado === 'inactivo') return false;
    if (!promo?.desde || !promo?.hasta) return promo?.estado === 'activo';
    const start = new Date(promo.desde);
    const end = new Date(promo.hasta);
    return now >= start && now <= end;
  });
}

function getPromoPrice(promo) {
  if (!promo || typeof promo !== 'object') return null;
  if (Number.isFinite(promo.precio_regular)) return promo.precio_regular;
  if (Number.isFinite(promo.precio_especial)) return promo.precio_especial;
  if (Number.isFinite(promo.monto_minimo)) return promo.monto_minimo;
  return null;
}

function buildTickerItem(promo) {
  const title = promo?.titulo ? escapeHTML(promo.titulo) : 'Combo';
  const badge = promo?.badge ? escapeHTML(promo.badge) : 'Combo';
  const price = getPromoPrice(promo);
  const priceLabel = Number.isFinite(price) ? `$${Math.round(price)} MXN` : '';
  const accentColor =
    typeof promo?.color_acento === 'string' && /^#([0-9a-fA-F]{3}){1,2}$/.test(promo.color_acento)
      ? promo.color_acento
      : '';
  const accentStyle = accentColor ? ` style="--ticker-accent: ${accentColor}"` : '';

  return `
    <span class="promo-ticker__item"${accentStyle}>
      <span class="promo-ticker__badge">${badge}</span>
      <span class="promo-ticker__title">${title}</span>
      ${priceLabel ? `<span class="promo-ticker__price">${priceLabel}</span>` : ''}
    </span>
  `;
}

export async function initPromoTicker() {
  if (tickerLoaded) return;

  const track = document.querySelector('[data-promo-ticker]');
  if (!track) return;

  tickerLoaded = true;

  const promos = await loadJSON(CONFIG.DATA_PATHS.promos);
  const activePromos = getActivePromos(promos);
  const ticker = track.closest('.promo-ticker');
  const srLabel = document.querySelector('[data-promo-ticker-sr]');

  if (!activePromos.length) {
    if (ticker) ticker.hidden = true;
    return;
  }

  const items = activePromos.map(buildTickerItem);
  const content = items.join('<span class="promo-ticker__sep">•</span>');
  track.innerHTML = `
    <div class="promo-ticker__lane">${content}</div>
    <div class="promo-ticker__lane" aria-hidden="true">${content}</div>
  `;

  const duration = Math.max(18, activePromos.length * 6);
  track.style.setProperty('--ticker-duration', `${duration}s`);

  if (srLabel) {
    const labels = activePromos.map(promo => {
      const price = getPromoPrice(promo);
      const priceLabel = Number.isFinite(price) ? `$${Math.round(price)} MXN` : 'precio especial';
      return `${promo.titulo || 'Combo'} ${priceLabel}`;
    });
    srLabel.textContent = `Combos activos: ${labels.join(', ')}`;
  }
}
