/**
 * Promociones: carga diferida, render y carrusel.
 */

import CONFIG from './config.js';
import { loadJSON } from './data-loader.js';
import { addHealthReport, flushHealthReports } from './health-report.js';
import { escapeHTML, sanitizeURL } from './security.js';
import { buildMessengerURL, formatDate } from './utils.js';
import { validatePromosData } from './validation.js';
import ResizeManager from './resize-manager.js';
import { revealInRoot } from './scroll-reveal.js';

let promosLoaded = false;
let carouselState = null;

function setupImageErrorFallbacks(root) {
  if (!root) return;
  root.querySelectorAll('img[data-placeholder]').forEach(img => {
    img.addEventListener('error', function () {
      const fallbacks = [
        this.getAttribute('data-fallback-raster'),
        this.getAttribute('data-placeholder'),
        CONFIG.PLACEHOLDER_PROMO_ICON
      ].filter(Boolean);
      const step = Number(this.dataset.fallbackStep || '0');
      if (step >= fallbacks.length) return;
      this.dataset.fallbackStep = String(step + 1);
      this.src = fallbacks[step];
    });
  });
}

function setupPromosCarousel(totalPromos) {
  const promosSection = document.getElementById('promos');
  const carouselContainer = promosSection?.querySelector('.carousel-container');
  const track = carouselContainer?.querySelector('#promos-container');
  const wrapper = carouselContainer?.querySelector('.carousel-wrapper');
  const prevBtn = carouselContainer?.querySelector('.carousel-btn-prev');
  const nextBtn = carouselContainer?.querySelector('.carousel-btn-next');
  const dotsContainer = promosSection?.querySelector('#promos-dots');

  if (!track || !wrapper || !prevBtn || !nextBtn || !dotsContainer) return;

  if (!carouselState) {
    carouselState = {
      track,
      wrapper,
      prevBtn,
      nextBtn,
      dotsContainer,
      currentIndex: 0,
      itemsPerView: 1,
      totalPromos
    };
  } else {
    carouselState.totalPromos = totalPromos;
  }

  const updateItemsPerView = () => {
    if (window.innerWidth >= 1024) {
      carouselState.itemsPerView = 3;
    } else if (window.innerWidth >= 768) {
      carouselState.itemsPerView = 2;
    } else {
      carouselState.itemsPerView = 1;
    }
  };

  const getTotalPages = () =>
    Math.ceil((carouselState.totalPromos || 1) / carouselState.itemsPerView);

  const updateTrack = () => {
    const wrapperWidth = carouselState.wrapper.clientWidth;
    const maxOffset = Math.max(carouselState.track.scrollWidth - wrapperWidth, 0);
    const offset = Math.min(carouselState.currentIndex * wrapperWidth, maxOffset);
    carouselState.track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    updateButtons();
    if (getTotalPages() > 1) updateDots();
  };

  const updateButtons = () => {
    const totalPages = getTotalPages();
    if (totalPages <= 1) {
      carouselState.prevBtn.disabled = true;
      carouselState.nextBtn.disabled = true;
      return;
    }
    carouselState.prevBtn.disabled = carouselState.currentIndex === 0;
    carouselState.nextBtn.disabled = carouselState.currentIndex >= totalPages - 1;
  };

  const createDots = totalPages => {
    carouselState.dotsContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', `Ir a página ${i + 1}`);
      if (i === carouselState.currentIndex) dot.classList.add('active');

      dot.addEventListener('click', () => {
        carouselState.currentIndex = i;
        updateTrack();
      });

      carouselState.dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    const dots = carouselState.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === carouselState.currentIndex);
    });
  };

  const syncNavigation = () => {
    const totalPages = getTotalPages();
    const shouldHideNav = totalPages <= 1;

    [carouselState.prevBtn, carouselState.nextBtn].forEach(btn => {
      btn.hidden = shouldHideNav;
      btn.setAttribute('aria-hidden', shouldHideNav ? 'true' : 'false');
      btn.tabIndex = shouldHideNav ? -1 : 0;
    });

    carouselState.dotsContainer.hidden = shouldHideNav;
    carouselState.dotsContainer.setAttribute('aria-hidden', shouldHideNav ? 'true' : 'false');

    if (shouldHideNav) {
      carouselState.track.style.transform = 'translate3d(0, 0, 0)';
      carouselState.currentIndex = 0;
      return;
    }

    createDots(totalPages);
    updateButtons();
  };

  if (!carouselState._bound) {
    carouselState.prevBtn.addEventListener('click', () => {
      if (carouselState.currentIndex > 0) {
        carouselState.currentIndex--;
        updateTrack();
      }
    });

    carouselState.nextBtn.addEventListener('click', () => {
      const totalPages = getTotalPages();
      if (carouselState.currentIndex < totalPages - 1) {
        carouselState.currentIndex++;
        updateTrack();
      }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    carouselState.track.addEventListener(
      'touchstart',
      e => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    carouselState.track.addEventListener(
      'touchend',
      e => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > swipeThreshold) {
          diff > 0 ? carouselState.nextBtn.click() : carouselState.prevBtn.click();
        }
      },
      { passive: true }
    );

    const handlePromosResize = () => {
      const oldItemsPerView = carouselState.itemsPerView;
      updateItemsPerView();
      if (oldItemsPerView !== carouselState.itemsPerView) {
        carouselState.currentIndex = 0;
      }
      syncNavigation();
      updateTrack();
    };

    ResizeManager.register(handlePromosResize);
    carouselState._bound = true;
  }

  updateItemsPerView();
  syncNavigation();
  updateTrack();
}

export async function initPromos({ onEvent } = {}) {
  if (promosLoaded) return;

  const promos = await loadJSON(CONFIG.DATA_PATHS.promos);
  const report = validatePromosData(promos);
  const promosSection = document.getElementById('promos');
  const container = document.getElementById('promos-container');
  if (!container || !promosSection) return;

  promosLoaded = true;

  if (!Array.isArray(promos) || promos.length === 0) {
    addHealthReport('promos', report);
    flushHealthReports();
    promosSection.hidden = true;
    return;
  }

  const now = new Date();
  const activePromos = promos.filter(promo => {
    if (promo.estado && promo.estado === 'inactivo') return false;
    if (!promo.desde || !promo.hasta) return promo.estado === 'activo';
    const start = new Date(promo.desde);
    const end = new Date(promo.hasta);
    return now >= start && now <= end;
  });

  report.summary.activas_hoy = activePromos.length;

  if (activePromos.length === 0) {
    addHealthReport('promos', report);
    flushHealthReports();
    promosSection.hidden = true;
    return;
  }

  promosSection.hidden = false;
  container.innerHTML = activePromos
    .map((promo, index) => {
      const destacadoClass = promo.destacado ? 'promo-destacado' : '';
      const animClass = promo.animacion ? `promo-anim-${promo.animacion}` : '';

      let precioHTML = '';
      if (promo.precio_regular) {
        const unitario = promo.precio_unitario
          ? `<span class="promo-unitario">$${promo.precio_unitario.toFixed(2)} c/u</span>`
          : '';
        precioHTML = `
        <div class="promo-precio">
          <span class="promo-precio-total">$${promo.precio_regular}</span>
          ${unitario}
        </div>
      `;
      } else if (promo.precio_especial) {
        precioHTML = `
        <div class="promo-precio">
          <span class="promo-precio-especial">$${promo.precio_especial}</span>
        </div>
      `;
      } else if (promo.monto_minimo) {
        precioHTML = `
        <div class="promo-minimo">
          <span>Mínimo: $${promo.monto_minimo}</span>
        </div>
      `;
      }

      const accentColor =
        typeof promo.color_acento === 'string' &&
        /^#([0-9a-fA-F]{3}){1,2}$/.test(promo.color_acento)
          ? promo.color_acento
          : '';
      const badgeStyle = accentColor ? ` style="--badge-color: ${accentColor}"` : '';
      const badgeHTML = promo.badge
        ? `<span class="promo-badge"${badgeStyle}><span class="promo-badge-text">${escapeHTML(
            promo.badge
          )}</span></span>`
        : '';

      const beneficiosHTML =
        promo.beneficios && promo.beneficios.length > 0
          ? `
        <ul class="promo-beneficios">
          ${promo.beneficios.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>
      `
          : '';

      let validezHTML = '';
      if (promo.tipo === 'permanente') {
        validezHTML = '<p class="promo-validez">Beneficio permanente</p>';
      } else {
        validezHTML = '<p class="promo-validez">Disponibilidad limitada</p>';
      }

      const ctaHTML = promo.cta_url
        ? `
        <a href="${sanitizeURL(promo.cta_url)}" 
           class="btn btn-primary promo-cta" 
           target="_blank" 
           rel="noopener noreferrer" 
           data-promo-id="${escapeHTML(promo.id)}" 
           data-promo-name="${escapeHTML(promo.titulo)}">
          ${escapeHTML(promo.cta_text || 'Más info')}
        </a>
      `
        : `
        <button class="btn btn-primary promo-cta-contact" 
                data-promo-id="${escapeHTML(promo.id)}" 
                data-promo-name="${escapeHTML(promo.titulo)}">
          Consultar por WhatsApp
        </button>
      `;

      let iconoHTML = '';
      if (promo.icono) {
        if (promo.icono.endsWith('.svg')) {
          iconoHTML = `<img src="${sanitizeURL(
            promo.icono
          )}" alt="${escapeHTML(promo.titulo)}" class="promo-icon" width="200" height="200" loading="lazy" decoding="async" data-placeholder="${CONFIG.PLACEHOLDER_PROMO_ICON}" data-fallback-raster="assets/img/og-image.png" />`;
        } else {
          iconoHTML = `<span class="promo-emoji" aria-hidden="true">${escapeHTML(
            promo.icono
          )}</span>`;
        }
      } else {
        iconoHTML = `<span class="promo-emoji" aria-hidden="true">?</span>`;
      }

      return `
  <article class="card glass promo-card ${destacadoClass} ${animClass} animate-delay-${Math.min(
    index,
    5
  )}"${accentColor ? ` style="--promo-accent: ${accentColor}"` : ''} 
       data-animate="fade-up" 
       data-promo-tipo="${promo.tipo}">
      ${badgeHTML ? `<div class="promo-badge-wrapper">${badgeHTML}</div>` : ''}
      <div class="promo-icono-container">
        ${iconoHTML}
      </div>
      <h3 class="promo-titulo">${escapeHTML(promo.titulo)}</h3>
      <p class="promo-subtitulo">${escapeHTML(promo.subtitulo || promo.descripcion || '')}</p>
      ${precioHTML}
      ${beneficiosHTML}
      ${validezHTML}
      ${ctaHTML}
    </article>
  `;
    })
    .join('');

  revealInRoot(container);
  setupImageErrorFallbacks(container);
  setupPromosCarousel(activePromos.length);

  report.summary.renderizadas = activePromos.length;
  addHealthReport('promos', report);
  flushHealthReports();

  if (!container.dataset.ctaBound) {
    container.addEventListener('click', ev => {
      const a = ev.target.closest('.promo-cta');
      if (!a) return;
      onEvent?.('select_promotion', {
        promotion_id: a.getAttribute('data-promo-id') || '',
        promotion_name: a.getAttribute('data-promo-name') || ''
      });
    });

    container.addEventListener('click', ev => {
      const btn = ev.target.closest('.promo-cta-contact');
      if (!btn) return;
      const promoId = btn.getAttribute('data-promo-id') || '';
      const promoName = btn.getAttribute('data-promo-name') || 'Promoción';
      const ref = `promo:${promoId || promoName}`;
      window.open(buildMessengerURL(ref), '_blank', 'noopener');
      onEvent?.('contact_promo', {
        promotion_id: btn.getAttribute('data-promo-id') || '',
        promotion_name: promoName
      });
    });

    container.dataset.ctaBound = 'true';
  }
}
