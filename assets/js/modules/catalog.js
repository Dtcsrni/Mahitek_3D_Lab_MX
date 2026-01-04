/**
 * Muestrario: carga, render, filtros y carrusel.
 */

import CONFIG from './config.js';
import { loadJSON } from './data-loader.js';
import { addHealthReport } from './health-report.js';
import { escapeHTML, sanitizeURL, isEmojiLike } from './security.js';
import { buildMessengerURL } from './utils.js';
import { validateCatalogData } from './validation.js';
import ResizeManager from './resize-manager.js';
import { revealInRoot } from './scroll-reveal.js';

let allProducts = [];
let displayedProducts = [];
let carouselState = null;

export function calculateSalePrice(
  basePrice,
  markup = CONFIG.PRICE_MARKUP,
  step = CONFIG.PRICE_STEP
) {
  const price = basePrice * markup;
  return Math.ceil(price / step) * step;
}

export function getProducts() {
  return allProducts;
}

export function getDisplayedProducts() {
  return displayedProducts;
}

export async function loadProducts() {
  const productsBase = await loadJSON(CONFIG.DATA_PATHS.productsBase);
  const report = validateCatalogData(productsBase);
  allProducts = Array.isArray(productsBase) ? productsBase.filter(p => p.estado === 'activo') : [];
  displayedProducts = [...allProducts];
  report.summary.renderizados = displayedProducts.length;
  addHealthReport('catalogo', report);
  return displayedProducts;
}

function setupImageErrorFallbacks(root) {
  if (!root) return;
  root.querySelectorAll('img[data-placeholder]').forEach(img => {
    img.addEventListener('error', function () {
      const fallbacks = [
        this.getAttribute('data-fallback-raster'),
        this.getAttribute('data-placeholder'),
        CONFIG.PLACEHOLDER_IMAGE
      ].filter(Boolean);
      const step = Number(this.dataset.fallbackStep || '0');
      if (step >= fallbacks.length) return;
      this.dataset.fallbackStep = String(step + 1);
      this.src = fallbacks[step];
    });
  });
}

function renderProducts({ onEvent } = {}) {
  const carousel = document.getElementById('product-carousel');
  if (!carousel) return;

  if (displayedProducts.length === 0) {
    carousel.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-catalog.svg" alt="Sin coincidencias en el muestrario" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No hay piezas disponibles con estos filtros.</p>
      </div>
    `;
    setupImageErrorFallbacks(carousel);
    updateCatalogCarousel(0);
    return;
  }

  carousel.innerHTML = displayedProducts
    .map((product, index) => {
      const isEmoji = isEmojiLike(product.imagen);
      const safeName = escapeHTML(product.nombre || '');
      const mediaMarkup = isEmoji
        ? `<div class="product-emoji">${escapeHTML(product.imagen)}</div>`
        : `<img class="product-image" src="${sanitizeURL(product.imagen || CONFIG.PLACEHOLDER_IMAGE)}" alt="${safeName}" data-placeholder="${CONFIG.PLACEHOLDER_IMAGE}" loading="lazy" decoding="async" />`;

      const formatMetricValue = (value, suffix = '') => {
        if (value === undefined || value === null || value === '') return null;
        const numeric = typeof value === 'number' ? value : Number(value);
        const text = Number.isFinite(numeric) ? String(numeric) : String(value);
        return `${text}${suffix}`;
      };

      const specsData = [
        { label: 'Material', value: formatMetricValue(product.material) },
        { label: 'Peso', value: formatMetricValue(product.peso_g, ' g') },
        { label: 'Tiempo', value: formatMetricValue(product.tiempo_h, ' h') }
      ].filter(item => item.value);

      const specsMarkup = specsData.length
        ? `
        <div class="product-specs">
          ${specsData
            .slice(0, 3)
            .map(
              spec =>
                `<span class="product-spec"><strong>${escapeHTML(spec.label)}:</strong> ${escapeHTML(
                  spec.value
                )}</span>`
            )
            .join('')}
        </div>
      `
        : '';

      const maxTags = 3;
      const tags = Array.isArray(product.tags) ? product.tags.slice(0, maxTags) : [];
      const extraTags = Array.isArray(product.tags) ? product.tags.length - tags.length : 0;
      const tagsMarkup = tags.length
        ? `
        <div class="product-tags">
          ${tags.map(tag => `<span class="tag product-tag">${escapeHTML(tag)}</span>`).join('')}
          ${extraTags > 0 ? `<span class="tag product-tag">+${extraTags}</span>` : ''}
        </div>
      `
        : '';

      const rawPriceText = product.texto_precio
        ? escapeHTML(String(product.texto_precio))
        : product.precio_rango_mxn
          ? `$${escapeHTML(String(product.precio_rango_mxn))} MXN`
          : `$${escapeHTML(String(product.precio_mxn))} MXN`;
      const priceText = `Referencia: ${rawPriceText}`;

      const sugerenciasMarkup = product.sugerencias
        ? `<p class="product-suggestions"><strong>Sugerencias:</strong> ${escapeHTML(
            product.sugerencias
          )}</p>`
        : '';

      onEvent?.('view_item', {
        item_id: product.id,
        item_name: product.nombre,
        price: product.precio_mxn,
        item_category: product.categoria
      });

      return `
  <article class="card glass product-card animate-delay-${Math.min(index, 5)}" role="listitem" data-animate="fade-up">
      <div class="product-media">
        ${mediaMarkup}
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span class="product-sku">${escapeHTML(product.id || '')}</span>
          ${product.categoria ? `<span class="product-line">${escapeHTML(product.categoria)}</span>` : ''}
        </div>
        <h3 class="product-name">${safeName}</h3>
        <div class="product-pricing">
          <p class="product-price">${priceText}</p>
          <span class="product-price-note">Referencia por uso, escala/grosor y acabados.</span>
        </div>
        <p class="product-description">${escapeHTML(product.descripcion || '')}</p>
        ${specsMarkup}
        ${tagsMarkup}
        ${sugerenciasMarkup}
      </div>
      <a href="${buildMessengerURL(
        `product:${encodeURIComponent(product.id || '')}|${encodeURIComponent(product.nombre)}`
      )}" 
         class="btn btn-primary product-cta" 
         target="_blank" 
         rel="noopener noreferrer" 
         data-sku="${escapeHTML(product.id)}" 
         data-name="${escapeHTML(product.nombre)}">
        Explorar esta pieza
      </a>
    </article>
      `;
    })
    .join('');

  setupImageErrorFallbacks(carousel);
  revealInRoot(carousel);
  updateCatalogCarousel(displayedProducts.length);

  if (!carousel.dataset.ctaBound) {
    carousel.addEventListener('click', ev => {
      const btn = ev.target.closest('.product-cta');
      if (!btn) return;
      const sku = btn.getAttribute('data-sku');
      const name = btn.getAttribute('data-name');
      onEvent?.('select_item', { item_id: sku, item_name: name });
    });
    carousel.dataset.ctaBound = 'true';
  }
}

function setupCatalogCarousel() {
  if (carouselState) return carouselState;

  const track = document.getElementById('product-carousel');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsContainer = document.getElementById('catalog-dots');
  const hintLeft = document.querySelector('[data-carousel-hint="left"]');
  const hintRight = document.querySelector('[data-carousel-hint="right"]');

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return null;

  carouselState = {
    track,
    prevBtn,
    nextBtn,
    dotsContainer,
    hintLeft,
    hintRight,
    currentIndex: 0,
    itemsPerView: 1,
    totalItems: 0
  };

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
    Math.ceil((carouselState.totalItems || 1) / carouselState.itemsPerView);

  const updateTrack = () => {
    const offset = -carouselState.currentIndex * (100 / carouselState.itemsPerView);
    carouselState.track.style.transform = `translateX(${offset}%)`;
  };

  const updateHints = () => {
    if (!carouselState.hintLeft || !carouselState.hintRight) return;
    const totalPages = getTotalPages();
    const hasMultiple = totalPages > 1;
    const showLeft = hasMultiple && carouselState.currentIndex > 0;
    const showRight = hasMultiple && carouselState.currentIndex < totalPages - 1;
    carouselState.hintLeft.classList.toggle('is-active', showLeft);
    carouselState.hintRight.classList.toggle('is-active', showRight);
  };

  const updateButtons = () => {
    const totalPages = getTotalPages();
    carouselState.prevBtn.disabled = carouselState.currentIndex === 0;
    carouselState.nextBtn.disabled = carouselState.currentIndex >= totalPages - 1;
    if (totalPages <= 1) {
      carouselState.prevBtn.disabled = true;
      carouselState.nextBtn.disabled = true;
    }
    updateHints();
  };

  const rebuildDots = () => {
    const totalPages = getTotalPages();
    carouselState.dotsContainer.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      if (i === carouselState.currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        carouselState.currentIndex = i;
        updateTrack();
        updateButtons();
        updateDots();
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

  carouselState.prevBtn.addEventListener('click', () => {
    carouselState.currentIndex = Math.max(0, carouselState.currentIndex - 1);
    updateTrack();
    updateButtons();
    updateDots();
  });

  carouselState.nextBtn.addEventListener('click', () => {
    const totalPages = getTotalPages();
    carouselState.currentIndex = Math.min(totalPages - 1, carouselState.currentIndex + 1);
    updateTrack();
    updateButtons();
    updateDots();
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
        if (diff > 0) {
          carouselState.nextBtn.click();
        } else {
          carouselState.prevBtn.click();
        }
      }
    },
    { passive: true }
  );

  const handleCatalogResize = () => {
    const prevView = carouselState.itemsPerView;
    updateItemsPerView();
    if (prevView !== carouselState.itemsPerView) {
      carouselState.currentIndex = 0;
      updateTrack();
      updateButtons();
      rebuildDots();
    }
  };

  ResizeManager.register(handleCatalogResize);

  carouselState._updateItemsPerView = updateItemsPerView;
  carouselState._getTotalPages = getTotalPages;
  carouselState._updateTrack = updateTrack;
  carouselState._updateButtons = updateButtons;
  carouselState._rebuildDots = rebuildDots;
  carouselState._updateDots = updateDots;
  carouselState._updateHints = updateHints;

  updateItemsPerView();
  rebuildDots();
  updateTrack();
  updateButtons();

  return carouselState;
}

function updateCatalogCarousel(totalItems) {
  const state = setupCatalogCarousel();
  if (!state) return;
  state.totalItems = totalItems;
  state._updateItemsPerView();
  const totalPages = state._getTotalPages();
  state.currentIndex = Math.min(state.currentIndex, Math.max(totalPages - 1, 0));
  state._updateTrack();
  state._rebuildDots();
  state._updateButtons();
  state._updateDots();
}

export function filterProducts() {
  const categoryFilter = document.getElementById('category-filter')?.value || 'todas';
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

  displayedProducts = allProducts.filter(product => {
    const matchesCategory = categoryFilter === 'todas' || product.categoria === categoryFilter;
    const matchesSearch =
      !searchTerm ||
      (product.nombre || '').toLowerCase().includes(searchTerm) ||
      (product.descripcion || '').toLowerCase().includes(searchTerm) ||
      (product.tags || []).some(tag => tag.toLowerCase().includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

function setupFilters() {
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }
}

function buildCategoryOptions() {
  const select = document.getElementById('category-filter');
  if (!select) return;

  const categories = [...new Set(allProducts.map(p => p.categoria))].filter(Boolean);
  select.innerHTML = '';

  const optAll = document.createElement('option');
  optAll.value = 'todas';
  optAll.textContent = 'Todas';
  select.appendChild(optAll);

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = String(cat);
    opt.textContent = String(cat);
    select.appendChild(opt);
  });
}

export async function initCatalog({ onEvent } = {}) {
  await loadProducts();
  buildCategoryOptions();
  setupFilters();
  renderProducts({ onEvent });
}
