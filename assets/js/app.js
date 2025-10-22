// ===== Configuration =====
const CONFIG = {
  PRICE_MARKUP: 1.0,   // Ajusta si requieres recargo adicional
  PRICE_STEP: 10,      // Redondea al múltiplo de 10 MXN más cercano
  // Página de Facebook/Messenger
  MESSENGER_PAGE: 'mahitek3dlabmx',
  PLACEHOLDER_IMAGE: 'assets/img/placeholder-catalog.svg',
  DATA_PATHS: {
    brand: 'assets/data/brand.json',
    productsBase: 'data/products.json',
    promos: 'data/promos.json',
    social: 'data/social.json',
    faq: 'data/faq.json'
  }
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollObserver = null;

// ===== Analytics =====
function log(ev, params = {}) {
  try { gtag('event', ev, params); } catch (e) { /* no-op */ }
}

// ===== Price Calculation =====
function calculateSalePrice(basePrice, markup = CONFIG.PRICE_MARKUP, step = CONFIG.PRICE_STEP) {
  const price = basePrice * markup;
  return Math.round(price / step) * step;
}

// ===== Data Loading =====
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return null;
  }
}

// ===== Motion Helpers =====
function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const toggleState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  toggleState();
  window.addEventListener('scroll', toggleState, { passive: true });
}

function setupScrollReveal() {
  const animatedNodes = document.querySelectorAll('[data-animate]');
  if (!animatedNodes.length) return;

  if (prefersReducedMotion.matches) {
    animatedNodes.forEach(node => node.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  animatedNodes.forEach(node => scrollObserver.observe(node));
}

function registerAnimatedElements(root) {
  if (!root || !(root instanceof Element)) return;

  if (prefersReducedMotion.matches) {
    if (root.matches('[data-animate]')) {
      root.classList.add('is-visible');
    }
    root.querySelectorAll('[data-animate]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  if (!scrollObserver) return;

  const candidates = [];

  if (root.matches('[data-animate]') && !root.classList.contains('is-visible')) {
    candidates.push(root);
  }

  root.querySelectorAll('[data-animate]').forEach(el => {
    if (!el.classList.contains('is-visible')) {
      candidates.push(el);
    }
  });

  candidates.forEach(el => scrollObserver.observe(el));
}

// ===== Products =====
let allProducts = [];
let displayedProducts = [];

async function loadProducts() {
  const productsBase = await loadJSON(CONFIG.DATA_PATHS.productsBase);
  if (!productsBase) return;

  // Filter active products (no price calculation needed, prices are final)
  allProducts = productsBase
    .filter(p => p.estado === 'activo');

  displayedProducts = [...allProducts];
  renderProducts();
  populateCategoryFilter();
}

function renderProducts() {
  const carousel = document.getElementById('product-carousel');
  if (!carousel) return;

  if (displayedProducts.length === 0) {
    carousel.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-catalog.svg" alt="Sin coincidencias en el catálogo" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No se encontraron productos con los filtros seleccionados. Ajusta los filtros o cuéntanos qué estás buscando.</p>
      </div>
    `;
    registerAnimatedElements(carousel);
    initCarousel();
    return;
  }

  carousel.innerHTML = displayedProducts.map((product, index) => {
    const delay = Math.min(index, 5) * 80;
    
    // Usar emoji como imagen animada
    const emojiDisplay = product.imagen && !product.imagen.startsWith('/') && !product.imagen.includes('.') 
      ? `<div class="product-emoji">${product.imagen}</div>`
      : `<img src="${product.imagen}" alt="${product.nombre}" onerror="this.onerror=null;this.src='${CONFIG.PLACEHOLDER_IMAGE}';" />`;

    // Construir detalles del producto
    const detailsData = [
      { label: 'Material', value: product.material },
      { label: 'Incluye', value: product.incluye },
      { label: 'Variantes', value: product.variantes }
    ].filter(item => item.value);

    const detailMarkup = detailsData.length
      ? `
        <dl class="product-details">
          ${detailsData.map(detail => `
            <div>
              <dt>${detail.label}</dt>
              <dd>${detail.value}</dd>
            </div>
          `).join('')}
        </dl>
      `
      : '';

    const tagsMarkup = product.tags && product.tags.length
      ? `
        <div class="product-tags">
          ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      `
      : '';

    // Sugerencias de negocio
    const sugerenciasMarkup = product.sugerencias
      ? `<p class="product-suggestions">💡 <strong>Sugerencias:</strong> ${product.sugerencias}</p>`
      : '';

    // Analytics: vista de item al render
    log('view_item', {
      item_id: product.id,
      item_name: product.nombre,
      price: product.precio_mxn,
      item_category: product.categoria
    });

    return `
    <article class="card glass product-card" role="listitem" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <div class="product-media">
        ${emojiDisplay}
      </div>
      <div class="product-meta">
        <span class="product-sku">${product.id}</span>
        ${product.categoria ? `<span class="product-line">${product.categoria}</span>` : ''}
      </div>
      <h3 class="product-name">${product.nombre}</h3>
      <p class="product-price">$${product.precio_mxn} MXN</p>
      <p class="product-price-note">Precio por pieza. Personalización básica incluida donde aplica.</p>
      <p class="product-description">${product.descripcion || ''}</p>
      ${detailMarkup}
      ${tagsMarkup}
      ${sugerenciasMarkup}
      <a href="${buildMessengerURL(`product:${encodeURIComponent(product.id || '')}|${encodeURIComponent(product.nombre)}`)}" 
         class="btn btn-primary product-cta" 
         target="_blank" 
         rel="noopener" 
         data-sku="${product.id}" 
         data-name="${product.nombre}">
        Consultar disponibilidad en Messenger
      </a>
    </article>
  `;
  }).join('');

  registerAnimatedElements(carousel);
  initCarousel();

  // Log de interacción: add_to_cart en CTA
  carousel.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.product-cta');
    if (!btn) return;
    log('add_to_cart', {
      item_id: btn.getAttribute('data-sku') || '',
      item_name: btn.getAttribute('data-name') || ''
    });
  }, { once: true });
}

// ===== Carousel Controls =====
function initCarousel() {
  const carousel = document.getElementById('product-carousel');
  const prevBtn = document.querySelector('.carousel-btn--prev');
  const nextBtn = document.querySelector('.carousel-btn--next');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  const container = carousel?.closest('.carousel-container');
  
  if (!carousel || !prevBtn || !nextBtn) return;

  const cards = carousel.querySelectorAll('.product-card');
  if (cards.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  let interactionTimeout = null;

  // Accesibilidad básica
  carousel.setAttribute('tabindex', '0');
  carousel.setAttribute('aria-roledescription', 'Carrusel de productos');
  carousel.setAttribute('aria-label', 'Catálogo de productos');

  // Crear indicadores
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = Array.from(cards).map((_, i) => 
      `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir a producto ${i + 1}"></button>`
    ).join('');

    indicatorsContainer.addEventListener('click', (e) => {
      const indicator = e.target.closest('.carousel-indicator');
      if (!indicator) return;
      const index = parseInt(indicator.dataset.index, 10);
      scrollToCard(index);
      log('carousel_navigation', { method: 'indicator', index });
      pauseAutoplayTemporarily();
    });
  }

  function scrollToCard(index) {
    if (index < 0 || index >= cards.length) return;
    
    currentIndex = index;
    cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    
    updateControls();
  }

  function updateControls() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;

    // Actualizar indicadores
    if (indicatorsContainer) {
      indicatorsContainer.querySelectorAll('.carousel-indicator').forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentIndex);
      });
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) scrollToCard(currentIndex - 1);
    log('carousel_navigation', { method: 'button', direction: 'prev', index: currentIndex });
    pauseAutoplayTemporarily();
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) scrollToCard(currentIndex + 1);
    log('carousel_navigation', { method: 'button', direction: 'next', index: currentIndex });
    pauseAutoplayTemporarily();
  });

  // Detectar scroll manual y actualizar índice
  let scrollTimeout;
  carousel.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = carousel.scrollLeft;
      // Encontrar la tarjeta más cercana a la posición actual de scroll
      let nearestIndex = 0;
      let minDelta = Infinity;
      cards.forEach((card, i) => {
        const delta = Math.abs(card.offsetLeft - scrollLeft);
        if (delta < minDelta) {
          minDelta = delta;
          nearestIndex = i;
        }
      });
      currentIndex = nearestIndex;
      updateControls();
    }, 80);
  }, { passive: true });

  // Soporte táctil mejorado
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentIndex < cards.length - 1) {
        scrollToCard(currentIndex + 1);
        log('carousel_navigation', { method: 'swipe', direction: 'next', index: currentIndex });
      } else if (diff < 0 && currentIndex > 0) {
        scrollToCard(currentIndex - 1);
        log('carousel_navigation', { method: 'swipe', direction: 'prev', index: currentIndex });
      }
      pauseAutoplayTemporarily();
    }
  }

  // Controles de teclado
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < cards.length - 1) {
        scrollToCard(currentIndex + 1);
        log('carousel_navigation', { method: 'keyboard', direction: 'next', index: currentIndex });
        pauseAutoplayTemporarily();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        scrollToCard(currentIndex - 1);
        log('carousel_navigation', { method: 'keyboard', direction: 'prev', index: currentIndex });
        pauseAutoplayTemporarily();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToCard(0);
      pauseAutoplayTemporarily();
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToCard(cards.length - 1);
      pauseAutoplayTemporarily();
    }
  });

  // Autoplay deshabilitado para no mover el scroll automáticamente
  function startAutoplay() {
    // Autoplay disabled - users prefer manual control
    return;
    /* 
    if (prefersReducedMotion.matches) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (document.hidden) return; // pausa si tab no es visible
      if (currentIndex < cards.length - 1) {
        scrollToCard(currentIndex + 1);
      } else {
        scrollToCard(0);
      }
      log('carousel_navigation', { method: 'autoplay', index: currentIndex });
    }, 5000);
    */
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function pauseAutoplayTemporarily() {
    // Autoplay disabled - no need to pause/resume
    return;
    /*
    stopAutoplay();
    if (interactionTimeout) clearTimeout(interactionTimeout);
    interactionTimeout = setTimeout(() => {
      startAutoplay();
    }, 8000);
    */
  }

  // Eventos de hover/focus deshabilitados (autoplay inactivo)
  /*
  if (container) {
    container.addEventListener('mouseenter', stopAutoplay, { passive: true });
    container.addEventListener('mouseleave', startAutoplay, { passive: true });
    container.addEventListener('focusin', stopAutoplay);
    container.addEventListener('focusout', startAutoplay);
  }
  */

  // startAutoplay(); // Comentado - autoplay deshabilitado
  log('carousel_init', { items: cards.length });
  updateControls();
}

function populateCategoryFilter() {
  const select = document.getElementById('category-filter');
  if (!select) return;

  const categories = [...new Set(allProducts.map(p => p.categoria))];
  
  select.innerHTML = '<option value="todas">Todas</option>' + 
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function filterProducts() {
  const categoryFilter = document.getElementById('category-filter')?.value || 'todas';
  const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

  displayedProducts = allProducts.filter(product => {
    const matchesCategory = categoryFilter === 'todas' || product.categoria === categoryFilter;
    const matchesSearch = !searchTerm || 
      product.nombre.toLowerCase().includes(searchTerm) ||
  (product.descripcion || '').toLowerCase().includes(searchTerm) ||
  (product.id || '').toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
    
    return matchesCategory && matchesSearch;
  });

  renderProducts();
}

// ===== Promos =====
async function loadPromos() {
  const promos = await loadJSON(CONFIG.DATA_PATHS.promos);
  const container = document.getElementById('promos-container');
  if (!container) return;

  if (!promos || promos.length === 0) {
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-promos.svg" alt="Promociones en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>Estamos preparando nuevas promociones. Escríbenos y recibe un adelanto personalizado.</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  const now = new Date();
  const activePromos = promos.filter(promo => {
    const start = new Date(promo.desde);
    const end = new Date(promo.hasta);
    return now >= start && now <= end;
  });

  if (activePromos.length === 0) {
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-promos.svg" alt="Promociones en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>No hay promociones activas en este momento. ¡Escríbenos y te contamos qué estamos creando!</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  container.innerHTML = activePromos.map((promo, index) => {
    const delay = Math.min(index, 4) * 90;
    return `
    <article class="card glass promo-card" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <h3>${promo.titulo}</h3>
      <p>${promo.mensaje}</p>
      <p class="promo-dates">📅 Válido del ${formatDate(promo.desde)} al ${formatDate(promo.hasta)}</p>
      <a href="${promo.cta_url}" class="btn btn-primary promo-cta" target="_blank" rel="noopener" data-promo-id="${promo.id || promo.titulo}" data-promo-name="${promo.titulo}">
        ${promo.cta_text}
      </a>
    </article>
  `;
  }).join('');

  registerAnimatedElements(container);

  container.addEventListener('click', (ev) => {
    const a = ev.target.closest('.promo-cta');
    if (!a) return;
    log('select_promotion', {
      promotion_id: a.getAttribute('data-promo-id') || '',
      promotion_name: a.getAttribute('data-promo-name') || ''
    });
  }, { once: true });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Build Messenger URL with optional ref
function buildMessengerURL(ref) {
  const base = `https://m.me/${CONFIG.MESSENGER_PAGE}`;
  if (!ref) return base;
  return `${base}?ref=${encodeURIComponent(ref)}`;
}

// ===== FAQ =====
async function loadFAQ() {
  const faqData = await loadJSON(CONFIG.DATA_PATHS.faq);
  const container = document.getElementById('faq-list');
  if (!container) return;

  if (!faqData || faqData.length === 0) {
    container.innerHTML = `
      <div class="card glass placeholder-card" data-animate="fade-up">
        <img src="assets/img/placeholder-faq.svg" alt="Preguntas frecuentes en preparación" class="placeholder-illustration" width="320" height="240" loading="lazy" decoding="async" />
        <p>Aún estamos documentando las preguntas frecuentes. Escríbenos por Messenger y resolvemos tu caso.</p>
      </div>
    `;
    registerAnimatedElements(container);
    return;
  }

  container.innerHTML = faqData.map((item, index) => {
    const delay = Math.min(index, 5) * 70;
    return `
    <details class="faq-item" data-animate="fade-up" style="--animate-delay: ${delay}ms;">
      <summary>${item.q}</summary>
      <p>${item.a}</p>
    </details>
  `;
  }).join('');

  registerAnimatedElements(container);
}

// ===== Social Links =====
async function loadSocialLinks() {
  // Preferimos brand.json si existe
  let social = null;
  const brand = await loadJSON(CONFIG.DATA_PATHS.brand);
  if (brand && brand.social) {
    social = brand.social;
  } else {
    social = await loadJSON(CONFIG.DATA_PATHS.social);
  }
  if (!social) return;

  const container = document.getElementById('social-links');
  if (!container) return;

  // Build icon-only, accessible links with larger clickable area
  const links = [];
  if (social.instagram) links.push({ key: 'instagram', label: 'Instagram', url: social.instagram });
  if (social.facebook) links.push({ key: 'facebook', label: 'Facebook', url: social.facebook });
  if (social.tiktok) links.push({ key: 'tiktok', label: 'TikTok', url: social.tiktok });

  container.innerHTML = links.map(link => `
    <a class="social-icon social-icon--${link.key}" href="${link.url}" target="_blank" rel="noopener" aria-label="${link.label}" title="${link.label}">
      ${getSocialIconMarkup(link.key)}
      <span class="sr-only">${link.label}</span>
    </a>
  `).join('');
}

// Oficial logos via Simple Icons CDN (CC0) — single-color SVGs
function getSocialIconMarkup(platform) {
  const color = 'FFFFFF'; // white glyph for contrast on multicolor backgrounds
  const size = 28;
  const base = 'https://cdn.simpleicons.org';
  const map = {
    instagram: `${base}/instagram/${color}`,
    facebook: `${base}/facebook/${color}`,
    tiktok: `${base}/tiktok/${color}`
  };
  const src = map[platform] || `${base}/link/${color}`;
  return `<img src="${src}" width="${size}" height="${size}" alt="" loading="lazy" decoding="async" aria-hidden="true" />`;
}

// ===== Navigation Toggle =====
function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  
  if (!toggle || !menu) return;

  const initialState = menu.classList.contains('active');
  toggle.setAttribute('aria-expanded', String(initialState));
  toggle.setAttribute('aria-label', initialState ? 'Cerrar menú' : 'Abrir menú');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    
    // Prevent body scroll when menu is open on mobile
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Log menu interaction
    log('nav_menu_toggle', { state: isOpen ? 'open' : 'closed' });
  });

  // Close menu when clicking on a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

// ===== Filter Events =====
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

// ===== Initialization =====
async function init() {
  setupNav();
  setupFilters();
  setupHeaderScroll();
  setupScrollReveal();
  hydrateEmails();
  
  // Load all data
  await Promise.all([
    loadProducts(),
    loadPromos(),
    loadFAQ(),
    loadSocialLinks()
  ]);

  // Aplicar estado desde la URL y sincronizar cambios
  applyURLState();

  console.log('✅ Mahitek 3D Lab loaded successfully');
  console.log(`📊 Products loaded: ${allProducts.length}`);
  console.log(`💰 Price markup: ${CONFIG.PRICE_MARKUP} (${(CONFIG.PRICE_MARKUP - 1) * 100}%)`);
  console.log(`🔄 Rounding step: $${CONFIG.PRICE_STEP} MXN`);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===== Email Obfuscation =====
function hydrateEmails() {
  const links = document.querySelectorAll('.email-link[data-email-user][data-email-domain]');
  links.forEach(link => {
    const user = link.getAttribute('data-email-user');
    const domain = link.getAttribute('data-email-domain');
    if (!user || !domain) return;
    const email = `${user}@${domain}`;
    link.setAttribute('href', `mailto:${email}`);
    // If a custom label provided, keep text; else fill with email
    const label = link.getAttribute('data-email-label');
    if (!link.textContent.trim() || label) {
      link.textContent = label || email;
    }
    // Reduce scraping signals
    link.setAttribute('rel', `${link.getAttribute('rel') || ''} nofollow noopener`);
  });
}

// Export for debugging
window.MahitekLab = {
  config: CONFIG,
  calculateSalePrice,
  products: () => allProducts,
  filterProducts
};

// ===== URL State (opcional) =====
function applyURLState() {
  const sp = new URLSearchParams(location.search);
  const mat = sp.get('m');
  const q = sp.get('q');
  const p = sp.get('p');

  const catSel = document.getElementById('category-filter');
  const search = document.getElementById('search-input');
  let changed = false;

  if (mat && catSel) { catSel.value = mat; changed = true; }
  if (q && search) { search.value = q; changed = true; }

  if (changed) {
    filterProducts();
  }

  if (p) {
    const card = [...document.querySelectorAll('.product-card')]
      .find(c => c.querySelector('.product-sku')?.textContent.includes(p));
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '2px solid rgba(6, 182, 212, 0.7)';
      setTimeout(() => { card.style.outline = 'none'; }, 2000);
    }
  }

  const updateURL = () => {
    const params = new URLSearchParams(location.search);
    const mVal = catSel?.value && catSel.value !== 'todas' ? catSel.value : '';
    const qVal = search?.value?.trim() || '';
    if (mVal) params.set('m', mVal); else params.delete('m');
    if (qVal) params.set('q', qVal); else params.delete('q');
    history.replaceState(null, '', `${location.pathname}${params.toString() ? `?${params}` : ''}`);
  };

  if (catSel) catSel.addEventListener('change', updateURL);
  if (search) search.addEventListener('input', updateURL);
}
